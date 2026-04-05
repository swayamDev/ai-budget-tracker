import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export const metadata = { title: 'Sign In' };

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        baseTheme: dark,
        elements: {
          rootBox: 'w-full',
          card: 'bg-card border border-border shadow-soft rounded-2xl',
          headerTitle: 'text-foreground font-bold text-2xl',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'border-border hover:bg-secondary/50 text-foreground',
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground',
          formFieldInput: 'bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20',
          formFieldLabel: 'text-foreground',
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground font-semibold',
          footerActionLink: 'text-primary hover:text-primary/80',
          identityPreviewText: 'text-foreground',
          identityPreviewEditButton: 'text-primary',
        },
      }}
    />
  );
}
