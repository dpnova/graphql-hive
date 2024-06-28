import { useEffect, useState } from 'react';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
// import { ResetPasswordForm } from '@/components/auth/reset-password';
// import { SignInForm } from '@/components/auth/sign-in';
// import { SignUpForm } from '@/components/auth/sign-up';
import { FullLogo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { DottedBackground } from '@/components/ui/dotted-background';
import { Meta } from '@/components/ui/meta';
import { Spinner } from '@/components/v2';
import { HiveLogo } from '@/components/v2/icon';
import { env } from '@/env/frontend';
import { startAuthFlowForProvider } from '@/lib/supertokens/start-auth-flow-for-provider';
import { startAuthFlowForOIDCProvider } from '@/lib/supertokens/third-party-email-password-react-oidc-provider';
import { Outlet, useRouter } from '@tanstack/react-router';

const supertokenRoutes = new Set(['/auth/verify-email']);

// TODO: create this route
if (env.auth.github) {
  supertokenRoutes.add('/auth/callback/github');
}

// TODO: create this route
if (env.auth.google) {
  supertokenRoutes.add('/auth/callback/google');
}

// TODO: create this route
if (env.auth.okta) {
  supertokenRoutes.add('/auth/callback/okta');
}

// TODO: create this route
if (env.auth.organizationOIDC) {
  supertokenRoutes.add('/auth/oidc');
  supertokenRoutes.add('/auth/callback/oidc');
}

function useOidcProviderId() {
  if (typeof window === 'undefined') {
    return {
      loading: true,
    } as const;
  }

  const url = new URL(window.location.href, env.appBaseUrl);

  if (!supertokenRoutes.has(url.pathname)) {
    return {
      loading: false,
      notFound: true,
    } as const;
  }

  if (env.auth.organizationOIDC === true) {
    const id = url.searchParams.get('id');

    if (url.pathname === '/auth/oidc') {
      if (!id) {
        return {
          loading: false,
          notFound: true,
        } as const;
      }

      return {
        loading: false,
        id,
      } as const;
    }
  }

  return {
    loading: false,
    id: null,
  } as const;
}

const isOkta = () =>
  env.auth.okta !== null &&
  new URLSearchParams(globalThis.window?.location.search ?? '').get('provider') === 'okta';

/**
 * Route for showing the SuperTokens login page.
 */
export function AuthPage() {
  const [error, setError] = useState<string | null>(null);
  // const oidcProvider = useOidcProviderId();
  const router = useRouter();
  const session = useSessionContext();

  // const [page, setPage] = useState<'login' | 'register' | 'reset-password'>('login');

  // if (router.latestLocation.pathname === '/auth/reset-password' && page !== 'reset-password') {
  //   setPage('reset-password');
  // }

  // useEffect(() => {
  //   let task: null | Promise<void> = null;

  //   if (oidcProvider.loading) {
  //     return;
  //   }

  //   if ('id' in oidcProvider && oidcProvider.id) {
  //     task = startAuthFlowForOIDCProvider(oidcProvider.id);
  //   } else if (
  //     // In case we are directed here from the Okta dashboard we automatically start the login flow.
  //     isOkta()
  //   ) {
  //     task = startAuthFlowForProvider('okta');
  //   }

  //   task?.catch((err: unknown) => {
  //     if (err instanceof Error) {
  //       setError(err.message);
  //       return;
  //     }
  //     setError('An unexpected error occurred.');
  //   });
  // }, [oidcProvider]);

  // if (oidcProvider.loading) {
  //   return null;
  // }

  // if (oidcProvider.notFound) {
  //   void router.navigate({
  //     to: '/404',
  //   });
  //   return null;
  // }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Meta title="Welcome" />
      {
        /*oidcProvider.id*/ false ? (
          <>
            <FullLogo
              className="mx-auto my-5 text-yellow-500"
              width={150}
              color={{ main: '#fff', sub: '#fff' }}
            />
            <div className="mx-auto max-w-md rounded-md bg-white p-5 text-center">
              {error ? (
                <>
                  <div className="text-red-500">{error}</div>
                  <div className="mt-3">
                    <Button variant="secondary">
                      {/** No NextLink because we want to avoid client side routing for reasons. */}
                      <a href="/auth">Back to login</a>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Spinner className="mx-auto size-20" />
                  <div className="mt-3">Starting OIDC Login Flow.</div>
                </>
              )}
            </div>
          </>
        ) : (
          <DottedBackground>
            {session.loading ? (
              <HiveLogo animated={false} className="size-16 animate-pulse" />
            ) : (
              <Outlet />
            )}
          </DottedBackground>
        )
      }
    </div>
  );
}
