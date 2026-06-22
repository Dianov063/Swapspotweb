-- 010_account_safety.sql
-- Tables: user_reports, blocked_users
-- Modifies: messages INSERT policy to block messaging between blocked users
-- Modifies: FK delete rules so account deletion cascades cleanly

-- ============================================================
-- 1. user_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(reason) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_report CHECK (reporter_id <> reported_id)
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report others"
  ON public.user_reports FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.user_reports FOR SELECT TO authenticated
  USING ((select auth.uid()) = reporter_id);

REVOKE ALL ON public.user_reports FROM anon;
GRANT SELECT, INSERT ON public.user_reports TO authenticated;

-- ============================================================
-- 2. blocked_users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id),
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = blocker_id);

CREATE POLICY "Users can view own blocks"
  ON public.blocked_users FOR SELECT TO authenticated
  USING ((select auth.uid()) = blocker_id);

CREATE POLICY "Users can unblock"
  ON public.blocked_users FOR DELETE TO authenticated
  USING ((select auth.uid()) = blocker_id);

REVOKE ALL ON public.blocked_users FROM anon;
GRANT SELECT, INSERT, DELETE ON public.blocked_users TO authenticated;

-- ============================================================
-- 3. Update messages INSERT policy — deny between blocked users
-- ============================================================
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.messages;

CREATE POLICY "Users can send messages in own conversations"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.client_id = (select auth.uid()) OR c.helper_id = (select auth.uid()))
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users ub
      WHERE (ub.blocker_id = (select auth.uid()) AND ub.blocked_id = messages.sender_id)
         OR (ub.blocked_id = (select auth.uid()))
    )
  );

-- ============================================================
-- 4. Fix FK delete rules for clean account deletion
--    Change NO ACTION → CASCADE for user-owned data
-- ============================================================

-- bookings: SET NULL so the other party keeps booking history
ALTER TABLE public.bookings DROP CONSTRAINT bookings_client_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.bookings DROP CONSTRAINT bookings_helper_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_helper_id_fkey
  FOREIGN KEY (helper_id) REFERENCES public.helpers(id) ON DELETE SET NULL;

-- Make client_id and helper_id nullable (required for SET NULL)
ALTER TABLE public.bookings ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN helper_id DROP NOT NULL;

-- messages.sender_id: SET NULL to keep message history readable
ALTER TABLE public.messages DROP CONSTRAINT messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.messages ALTER COLUMN sender_id DROP NOT NULL;

-- quotes: SET NULL
ALTER TABLE public.quotes DROP CONSTRAINT quotes_client_id_fkey;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.quotes ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.quotes DROP CONSTRAINT quotes_helper_id_fkey;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_helper_id_fkey
  FOREIGN KEY (helper_id) REFERENCES public.helpers(id) ON DELETE SET NULL;
ALTER TABLE public.quotes ALTER COLUMN helper_id DROP NOT NULL;

-- reviews: SET NULL (keep reviews visible but anonymize)
ALTER TABLE public.reviews DROP CONSTRAINT reviews_reviewer_id_fkey;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.reviews ALTER COLUMN reviewer_id DROP NOT NULL;

ALTER TABLE public.reviews DROP CONSTRAINT reviews_reviewee_id_fkey;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_reviewee_id_fkey
  FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.reviews ALTER COLUMN reviewee_id DROP NOT NULL;

-- booking_items: CASCADE via booking (already handled), but fix service FK
-- (service_id stays NO ACTION — services cascade via helper already)

-- ============================================================
-- 5. Function to fully delete a user (called by edge function)
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only the user themselves or an admin can delete
  IF target_user_id <> auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized to delete this account';
  END IF;

  -- Delete profile (cascades to: helpers → services, availability,
  -- payment_methods, portfolio_photos, saved_helpers, conversations → messages,
  -- user_reports, blocked_users)
  -- FK SET NULL handles: bookings, quotes, reviews, messages.sender_id
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;
