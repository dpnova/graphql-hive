import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FaGithub, FaGoogle, FaRegUserCircle } from 'react-icons/fa';
import { emailPasswordSignIn as superSignIn } from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useRouter } from '@tanstack/react-router';

const SignInFormSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignInFormValues = z.infer<typeof SignInFormSchema>;

export function SignInForm(props: { onSignUp(): void }) {
  const signIn = useMutation({
    mutationFn: superSignIn,
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

  const router = useRouter();
  const loc = useLocation();
  const redirectToPath =
    'redirectToPath' in loc.search && typeof loc.search.redirectToPath === 'string'
      ? loc.search.redirectToPath || '/'
      : '/';

  switch (signIn.data?.status) {
    case 'OK': {
      router.navigate({
        to: redirectToPath,
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
      signIn.data.formFields.forEach(field => {
        form.setError(field.id as 'email' | 'password', {
          type: 'manual',
          message: field.error,
        });
      });
    }
    case 'SIGN_IN_NOT_ALLOWED': {
      toast({
        title: 'Sign in not allowed',
        description: 'Please contact support for assistance.',
        variant: 'destructive',
      });
    }
  }

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
                        href="#"
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
