import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
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

export function AuthSSOPage(props: { redirectToPath?: string }) {
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
            <CardTitle className="text-2xl">Login SSO</CardTitle>
            <CardDescription>Sign in to your account with a company email</CardDescription>
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
                    <FormLabel>Company email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@acme.com" type="email" {...field} />
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
        </div>
        <div className="mt-4 text-center text-sm">
          <Link to="/auth/sign-up" data-auth-link="sign-up" className="underline">
            Back to other sign-in options
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
