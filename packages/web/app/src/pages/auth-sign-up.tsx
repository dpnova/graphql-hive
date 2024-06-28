import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { sendVerificationEmail } from 'supertokens-auth-react/recipe/emailverification';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { emailPasswordSignUp } from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
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
import { env } from '@/env/frontend';
import { exhaustiveGuard } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, Navigate, useLocation, useRouter } from '@tanstack/react-router';

const SignUpFormSchema = z.object({
  firstName: z.string({
    required_error: 'First name is required',
  }),
  lastName: z.string({
    required_error: 'Last name is required',
  }),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

export function AuthSignUpPage() {
  const router = useRouter();
  const loc = useLocation();
  const redirectToPath =
    'redirectToPath' in loc.search && typeof loc.search.redirectToPath === 'string'
      ? loc.search.redirectToPath || '/'
      : '/';

  const session = useSessionContext();

  const sendVerificationEmailMutation = useMutation({
    mutationFn: () => sendVerificationEmail(),
    onSuccess() {
      router.navigate({
        to: '/auth/verify-email',
      });
    },
    retry: 3,
    onError() {
      // In case of an error, we still want to redirect the user to the verify email page
      // so they can request a new verification email, if needed
      // and understand that the account was created.
      router.navigate({
        to: '/auth/verify-email',
      });
    },
  });

  const signUp = useMutation({
    // TODO: add `verifyEmail` to the mutation, but only when verification is required
    // currently the email is not sent when the user signs up
    mutationFn: emailPasswordSignUp,
    onSuccess(data) {
      const status = data.status;

      switch (status) {
        case 'OK': {
          if (env.auth.requireEmailVerification) {
            sendVerificationEmailMutation.mutate();
          } else {
            router.navigate({
              to: redirectToPath,
            });
          }
          break;
        }
        case 'FIELD_ERROR': {
          data.formFields.forEach(field => {
            form.setError(field.id as keyof SignUpFormValues, {
              type: 'manual',
              message: field.error,
            });
          });
          break;
        }
        case 'SIGN_UP_NOT_ALLOWED': {
          toast({
            title: 'Sign up not allowed',
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
      toast({
        title: 'An error occurred',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    disabled: signUp.isPending,
  });
  const { toast } = useToast();

  const onSubmit = useCallback(
    (data: SignUpFormValues) => {
      signUp.reset();
      signUp.mutate({
        formFields: [
          {
            id: 'email',
            value: data.email,
          },
          {
            id: 'password',
            value: data.password,
          },
          {
            id: 'firstName',
            value: data.firstName,
          },
          {
            id: 'lastName',
            value: data.lastName,
          },
        ],
      });
    },
    [signUp.mutate],
  );

  if (session.loading) {
    // AuthPage component already shows a loading state
    return null;
  }

  if (session.doesSessionExist) {
    // Redirect to the home page if the user is already signed in
    return <Navigate to="/" />;
  }

  const isVerificationSettled = env.auth.requireEmailVerification
    ? sendVerificationEmailMutation.isSuccess || sendVerificationEmailMutation.isError
    : true;

  return (
    <Card className="mx-auto w-full max-w-md bg-[#101014]">
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
          <Form {...form}>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Max" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Robinson" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={signUp.isPending}>
                {signUp.isSuccess && signUp.data.status === 'OK' && isVerificationSettled
                  ? 'Redirecting...'
                  : signUp.isPending
                    ? 'Creating account...'
                    : 'Create an account'}
              </Button>
            </form>
          </Form>
          <div className="flex flex-row items-center justify-between gap-x-4">
            <div className="h-[1px] w-full bg-gray-700" />
            <div className="text-center text-gray-400">or</div>
            <div className="h-[1px] w-full bg-gray-700" />
          </div>
          <Button variant="outline" className="w-full" disabled={signUp.isPending}>
            <FaGoogle className="mr-4 size-4" /> Sign up with Google
          </Button>
          <Button variant="outline" className="w-full" disabled={signUp.isPending}>
            <FaGithub className="mr-4 size-4" /> Sign up with Github
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/auth/sign-in" data-auth-link="sign-in" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
