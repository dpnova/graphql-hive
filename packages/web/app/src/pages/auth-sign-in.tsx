import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FaGithub, FaGoogle, FaRegUserCircle } from 'react-icons/fa';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { emailPasswordSignIn } from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
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
import { Link, Navigate, useRouter } from '@tanstack/react-router';

const SignInFormSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignInFormValues = z.infer<typeof SignInFormSchema>;

export function AuthSignInPage(props: { redirectToPath?: string }) {
  const session = useSessionContext();
  const router = useRouter();
  const signIn = useMutation({
    mutationFn: emailPasswordSignIn,
    onSuccess(data) {
      const status = data.status;

      switch (status) {
        case 'OK': {
          router.navigate({
            to: props.redirectToPath,
          });
          break;
        }
        case 'WRONG_CREDENTIALS_ERROR': {
          toast({
            title: 'Invalid email or password',
            description: 'Please check your email and password and try again.',
            variant: 'destructive',
          });
          break;
        }
        case 'FIELD_ERROR': {
          data.formFields.forEach(field => {
            form.setError(field.id as keyof SignInFormValues, {
              type: 'manual',
              message: field.error,
            });
          });
          break;
        }
        case 'SIGN_IN_NOT_ALLOWED': {
          toast({
            title: 'Sign in not allowed',
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
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    disabled: signIn.isPending,
  });
  const { toast } = useToast();

  const onSubmit = useCallback(
    (data: SignInFormValues) => {
      signIn.reset();
      signIn.mutate({
        formFields: [
          {
            id: 'email',
            value: data.email,
          },
          {
            id: 'password',
            value: data.password,
          },
        ],
      });
    },
    [signIn.mutate],
  );

  if (session.loading) {
    // AuthPage component already shows a loading state
    return null;
  }

  if (session.doesSessionExist) {
    // Redirect to the home page if the user is already signed in
    return <Navigate to="/" />;
  }

  return (
    <Card className="mx-auto w-full max-w-md bg-[#101014]">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <Link
                        tabIndex={-1}
                        to="/auth/reset-password"
                        search={{ email: form.getValues().email || undefined }}
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={signIn.isPending}>
                {signIn.data?.status === 'OK'
                  ? 'Redirecting...'
                  : signIn.isPending
                    ? 'Signing in...'
                    : 'Sign in'}
              </Button>
            </form>
          </Form>
          <div className="flex flex-row items-center justify-between gap-x-4">
            <div className="h-[1px] w-full bg-gray-700" />
            <div className="text-center text-gray-400">or</div>
            <div className="h-[1px] w-full bg-gray-700" />
          </div>
          {/* TODO: Google */}
          <Button variant="outline" className="w-full" disabled={signIn.isPending}>
            <FaGoogle className="mr-4 size-4" /> Login with Google
          </Button>
          {/* TODO: Github */}
          <Button variant="outline" className="w-full" disabled={signIn.isPending}>
            <FaGithub className="mr-4 size-4" /> Login with Github
          </Button>
          {/* TODO: https://github.com/kamilkisiela/graphql-hive/issues/4367 */}
          <Button asChild variant="outline" className="w-full" disabled={signIn.isPending}>
            <Link to="/auth/sso">
              <FaRegUserCircle className="mr-4 size-4" /> Login with SSO
            </Link>
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/auth/sign-up" data-auth-link="sign-up" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
