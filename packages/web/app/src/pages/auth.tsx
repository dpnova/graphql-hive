import { useEffect, useState } from 'react';
import { FaGithub, FaGoogle, FaRegUserCircle } from 'react-icons/fa';
import { FullLogo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DottedBackground } from '@/components/ui/dotted-background';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Meta } from '@/components/ui/meta';
import { Spinner } from '@/components/v2';
import { HiveLogo } from '@/components/v2/icon';
import { env } from '@/env/frontend';
import { useBrowser } from '@/lib/hooks/use-browser';
import { startAuthFlowForProvider } from '@/lib/supertokens/start-auth-flow-for-provider';
import { startAuthFlowForOIDCProvider } from '@/lib/supertokens/third-party-email-password-react-oidc-provider';
import { Link, useRouter } from '@tanstack/react-router';

const supertokenRoutes = new Set([
  '/auth/verify-email',
  '/auth/reset-password',
  '/auth/login',
  '/auth',
]);

if (env.auth.github) {
  supertokenRoutes.add('/auth/callback/github');
}
if (env.auth.google) {
  supertokenRoutes.add('/auth/callback/google');
}
if (env.auth.okta) {
  supertokenRoutes.add('/auth/callback/okta');
}
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
  const oidcProvider = useOidcProviderId();

  const [page, setPage] = useState<'login' | 'register'>('login');

  useEffect(() => {
    let task: null | Promise<void> = null;

    if (oidcProvider.loading) {
      return;
    }

    if ('id' in oidcProvider && oidcProvider.id) {
      task = startAuthFlowForOIDCProvider(oidcProvider.id);
    } else if (
      // In case we are directed here from the Okta dashboard we automatically start the login flow.
      isOkta()
    ) {
      task = startAuthFlowForProvider('okta');
    }

    task?.catch((err: unknown) => {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError('An unexpected error occurred.');
    });
  }, [oidcProvider]);

  const router = useRouter();
  const isBrowser = useBrowser();

  if (!isBrowser) {
    return null;
  }

  if (oidcProvider.loading) {
    return null;
  }

  if (oidcProvider.notFound) {
    void router.navigate({
      to: '/404',
    });
    return null;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Meta title="Welcome" />
      {oidcProvider.id ? (
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
          {page === 'login' && <SignInForm onSignUp={() => setPage('register')} />}
          {page === 'register' && <SignUpForm onSignIn={() => setPage('login')} />}
        </DottedBackground>
      )}
    </div>
  );
}

function SignInForm(props: { onSignUp(): void }) {
  return (
    <Card className="mx-auto w-full max-w-sm bg-[#101014]">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </div>
          <div>
            <HiveLogo animated={false} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <div className="flex flex-row items-center justify-between gap-x-4">
            <div className="h-[1px] w-full bg-gray-700" />
            <div className="text-center text-gray-400">or</div>
            <div className="h-[1px] w-full bg-gray-700" />
          </div>
          <Button variant="outline" className="w-full">
            <FaGoogle className="mr-4 size-4" /> Login with Google
          </Button>
          <Button variant="outline" className="w-full">
            <FaGithub className="mr-4 size-4" /> Login with Github
          </Button>
          <Button variant="outline" className="w-full">
            <FaRegUserCircle className="mr-4 size-4" /> Login with SSO
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="#" className="underline" onClick={props.onSignUp}>
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SignUpForm(props: { onSignIn(): void }) {
  return (
    <Card className="mx-auto w-full max-w-sm bg-[#101014]">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </div>
          <div>
            <HiveLogo animated={false} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" placeholder="Max" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" placeholder="Robinson" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full">
            Create an account
          </Button>
          <div className="flex flex-row items-center justify-between gap-x-4">
            <div className="h-[1px] w-full bg-gray-700" />
            <div className="text-center text-gray-400">or</div>
            <div className="h-[1px] w-full bg-gray-700" />
          </div>
          <Button variant="outline" className="w-full">
            <FaGoogle className="mr-4 size-4" /> Sign up with Google
          </Button>
          <Button variant="outline" className="w-full">
            <FaGithub className="mr-4 size-4" /> Sign up with Github
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="#" className="underline" onClick={props.onSignIn}>
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
