import {
  getEmailVerificationTokenFromURL,
  sendVerificationEmail,
  verifyEmail,
} from 'supertokens-auth-react/recipe/emailverification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { HiveLogo } from '@/components/v2/icon';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

export function AuthVerifyEmailPage() {
  const token = getEmailVerificationTokenFromURL();
  const enabled = typeof token === 'string' && token.length > 0;
  const { toast } = useToast();

  const sendVerificationEmailMutation = useMutation({
    mutationFn: () => sendVerificationEmail(),
    onSuccess(data) {
      if (data.status === 'OK') {
        toast({
          title: 'Verification email sent',
          description: 'Please check your email inbox.',
        });
      } else if (data.status === 'EMAIL_ALREADY_VERIFIED_ERROR') {
        toast({
          title: 'Email already verified',
          description: 'Your email address has already been verified.',
        });
      }
    },
  });
  const emailVerification = useQuery({
    queryFn: () => verifyEmail(),
    enabled,
    queryKey: ['email-verification', token],
  });

  if (!enabled) {
    return (
      <Card className="mx-auto w-full max-w-md bg-[#101014]">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">Verify your email address</CardTitle>
            </div>
            <div>
              <HiveLogo animated={false} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-y-4">
            <p>
              <span className="font-semibold">Please click on the link</span> in the email we just
              sent you to confirm your email address.
            </p>
            <Button
              className="w-full"
              disabled={sendVerificationEmailMutation.isPending}
              onClick={() => sendVerificationEmailMutation.mutate()}
            >
              Resend verification email
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to="/logout">Logout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (emailVerification.isPending) {
    return (
      <Card className="mx-auto w-full max-w-md bg-[#101014]">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">Verifying your email address</CardTitle>
              <CardDescription>This should only take a few seconds.</CardDescription>
            </div>
            <div>
              <HiveLogo animated={false} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-y-4">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-[#3c3c3c]"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (emailVerification.isError) {
    return (
      <Card className="mx-auto w-full max-w-md bg-[#101014]">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">Failed to verify your email</CardTitle>
            </div>
            <div>
              <HiveLogo animated={false} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-y-4">
            <p>There was an unexpected error when verifying your email address.</p>
            <Button
              className="w-full"
              disabled={sendVerificationEmailMutation.isPending}
              onClick={() => sendVerificationEmailMutation.mutate()}
            >
              Resend verification email
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to="/logout">Logout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (emailVerification.isSuccess && emailVerification.data.status === 'OK') {
    return (
      <Card className="mx-auto w-full max-w-md bg-[#101014]">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">Success!</CardTitle>
              <CardDescription>Your email address has been successfully verified.</CardDescription>
            </div>
            <div>
              <HiveLogo animated={false} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-y-4">
            <Button className="w-full">
              <Link to="/">Continue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (
    emailVerification.isSuccess &&
    emailVerification.data.status === 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR'
  ) {
    return (
      <Card className="mx-auto w-full max-w-md bg-[#101014]">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">Email verification</CardTitle>
            </div>
            <div>
              <HiveLogo animated={false} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-y-4">
            <p>The email verification link has expired.</p>
            <Button asChild className="w-full">
              <Link to="/auth">Continue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md bg-[#101014]">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">Verify your email address</CardTitle>
          </div>
          <div>
            <HiveLogo animated={false} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-y-4">
          <p>
            <span className="font-semibold">Please click on the link</span> in the email we just
            sent you to confirm your email address.
          </p>
          <Button
            className="w-full"
            disabled={sendVerificationEmailMutation.isPending}
            onClick={() => sendVerificationEmailMutation.mutate()}
          >
            Resend verification email
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link to="/logout">Logout</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
