-- Create invitations table
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Inviter can view their own invitations"
    ON public.invitations FOR SELECT
    USING (auth.uid() = inviter_id);

CREATE POLICY "Org admins can view invitations"
    ON public.invitations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = invitations.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Anyone with the email can view their invitation"
    ON public.invitations FOR SELECT
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Inviter can create invitations"
    ON public.invitations FOR INSERT
    WITH CHECK (
        auth.uid() = inviter_id AND
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = invitations.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Inviter can delete invitations"
    ON public.invitations FOR DELETE
    USING (
        auth.uid() = inviter_id OR
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = invitations.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );
