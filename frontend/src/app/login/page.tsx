'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormValues } from "@/lib/schemas/auth";
import { login } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      window.dispatchEvent(new Event('authchange'));
      router.push('/');
    },
  });

  const onSubmit = (values: LoginFormValues) => mutation.mutate(values);

  return (
    // Drive Background: Plain, light grey
     <div className="min-h-screen flex items-center justify-center bg-[#f1f3f4] dark:bg-[#202124] px-4">
      
      
      <div className="w-full max-w-md bg-white dark:bg-[#2d2e30] border border-[#dadce0] dark:border-[#5f6368] rounded-lg p-10 shadow-sm">
        
        
        <div className="flex flex-col items-center text-center mb-8">
          
          <img 
            src="/logo.png" 
            alt="LogicLens Logo" 
            className="h-12 w-12 object-contain mb-4"
          />
          <h1 className="text-2xl font-normal text-[#202124] dark:text-[#e8eaed]">Sign in</h1>
          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-1">Use your LogicLens Account</p>
        </div>

        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium text-[#202124]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@logiclens.com"
              {...register('email')}
              // Drive Input Style: Tall, grey border, blue on focus
              className="h-12 border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#3c4043] focus-visible:ring-0 focus-visible:border-[#1a73e8] dark:focus-visible:border-[#8ab4f8] text-[#202124] dark:text-[#e8eaed] rounded-md"
            />
            {errors.email && (
              <p className="text-sm text-[#d93025]">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm font-medium text-[#202124]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              className="h-12 border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#3c4043] focus-visible:ring-0 focus-visible:border-[#1a73e8] dark:focus-visible:border-[#8ab4f8] text-[#202124] dark:text-[#e8eaed] rounded-md"
            />
            {errors.password && (
              <p className="text-sm text-[#d93025]">{errors.password.message}</p>
            )}
          </div>

         
          {mutation.isError && (
            <div className="flex items-center gap-2 text-sm text-[#d93025] pt-2">
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              Invalid email or password. Please try again.
            </div>
          )}

          
          <Button 
            type="submit" 
            disabled={mutation.isPending}
             className="w-full h-12 bg-[#1a73e8] dark:bg-[#8ab4f8] hover:bg-[#1765cc] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] font-medium text-base rounded-md mt-6"
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Next'
            )}
          </Button>
        </form>
        
        
        <div className="mt-8 pt-6 border-t border-[#dadce0] text-center">
          <p className="text-xs text-[#5f6368]">
            © {new Date().getFullYear()} LogicLens. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}