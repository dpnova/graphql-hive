import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DocsLink } from '@/components/v2';
import { HiveLogo } from '@/components/v2/icon';
import { startAuthFlowForOIDCProvider } from '@/lib/supertokens/third-party-email-password-react-oidc-provider';
import { useQuery } from '@tanstack/react-query';

// TODO: provider=okta ? Should we do it still, is it needed?
export function AuthOIDCPage(props: { oidcId: string | undefined }) {
  const auth = useQuery({
    queryKey: ['oidc', props.oidcId],
    enabled: typeof props.oidcId === 'string' && props.oidcId.length > 0,
    queryFn: async (input: { oidcId: string }) => {
      await startAuthFlowForOIDCProvider(input.oidcId);
    },
  });

  if (!props.oidcId) {
    return <NoId />;
  }

  if (auth.isError) {
    return (
      <Card className="mx-auto w-full max-w-md bg-[#101014]">
        <CardHeader>
          <div className="flex flex-row items-center justify-between gap-x-4">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">OIDC Login Flow Failed</CardTitle>
              <CardDescription>{auth.error.message}</CardDescription>
            </div>
            <div>
              <HiveLogo animated={false} />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md bg-[#101014]">
      <CardHeader>
        <div className="flex flex-row items-center justify-between gap-x-4">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">Starting OIDC Login Flow</CardTitle>
            <CardDescription>You are being redirected to your OIDC provider.</CardDescription>
          </div>
          <div>
            <HiveLogo className="animate-pulse" animated={false} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function NoId() {
  return (
    <Card className="mx-auto w-full max-w-md bg-[#101014]">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">Missing ID</CardTitle>
            <CardDescription>You need to provide an OIDC ID to sign in.</CardDescription>
          </div>
          <div>
            <HiveLogo animated={false} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          <DocsLink href="/management/sso-oidc-provider#login-via-oidc">
            Learn how to login via OIDC
          </DocsLink>
        </p>
      </CardContent>
    </Card>
  );
}
