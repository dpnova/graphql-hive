import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { sendPasswordResetEmail } from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { HiveLogo } from '@/components/v2/icon';
import { exhaustiveGuard } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, Navigate, useLocation, useRouter } from '@tanstack/react-router';

const ResetPasswordFormSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address'),
});

type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;

export function AuthResetPasswordPage(props: { email: string | null }) {
  const router = useRouter();
  const initialEmail = props.email ?? '';

  const resetEmail = useMutation({
    mutationFn: sendPasswordResetEmail,
    onSuccess(data) {
      const status = data.status;

      switch (status) {
        case 'OK': {
          toast({
            title: 'Email sent',
            description: 'Please check your email to reset your password.',
          });
          break;
        }
        case 'FIELD_ERROR': {
          data.formFields.forEach(field => {
            form.setError(field.id as keyof ResetPasswordFormValues, {
              type: 'manual',
              message: field.error,
            });
          });
          break;
        }
        case 'PASSWORD_RESET_NOT_ALLOWED': {
          toast({
            title: 'Password reset not allowed',
            description: 'Please contact support for assistance.',
            variant: 'destructive',
          });
          break;
        }
        default: {
          exhaustiveGuard(status);
        }
      }
    },
    onError(error) {
      console.error(error);
      toast({
        title: 'An error occurred',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      email: initialEmail ?? '',
    },
    disabled: resetEmail.isPending,
  });
  const { toast } = useToast();

  const onSubmit = useCallback(
    (data: ResetPasswordFormValues) => {
      resetEmail.reset();
      resetEmail.mutate({
        formFields: [
          {
            id: 'email',
            value: data.email,
          },
        ],
      });
    },
    [resetEmail.mutate],
  );

  const session = useSessionContext();

  if (session.loading) {
    // AuthPage component already shows a loading state
    return null;
  }

  if (session.doesSessionExist) {
    // Redirect to the home page if the user is already signed in
    return <Navigate to="/" />;
  }

  const isSent = resetEmail.isSuccess && resetEmail.data.status === 'OK';

  if (isSent) {
    return (
      <Card className="mx-auto w-full max-w-md bg-[#101014]">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">Email sent</CardTitle>
            </div>
            <div>
              <HiveLogo animated={false} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-y-4">
            <p>
              A password reset email has been sent to{' '}
              <span className="font-semibold">{form.getValues().email}</span>, if it exists in our
              system.
            </p>
            <p className="text-muted-foreground text-sm">
              If you don't receive an email, try to{' '}
              <Link href="#" className="underline" onClick={resetEmail.reset}>
                reset your password again
              </Link>
              .
            </p>
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
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>We will send you an email to reset your password</CardDescription>
          </div>
          <div>
            <HiveLogo animated={false} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={resetEmail.isPending}>
              {resetEmail.data?.status === 'OK'
                ? 'Redirecting...'
                : resetEmail.isPending
                  ? '...'
                  : 'Email me'}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <Link to="/auth/sign-in" data-auth-link="sign-up" className="underline">
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
