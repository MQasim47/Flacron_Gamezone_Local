'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
   href?: string;
   label?: string;
   onClick?: () => void;
}

export function BackButton({ href, label = 'Back', onClick }: Props) {
   const router = useRouter();

   const handleClick = (e: React.MouseEvent) => {
      if (onClick) {
         e.preventDefault();
         onClick();
      } else if (!href) {
         e.preventDefault();
         router.back();
      }
   };

   const cls =
      'group inline-flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-cyan-500/30';

   const inner = (
      <>
         <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-slate-800/70 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300 shadow-lg flex-shrink-0">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
         </div>
         <span className="text-sm font-bold uppercase tracking-wide">
            {label}
         </span>
      </>
   );

   if (href)
      return (
         <Link href={href} className={cls} onClick={handleClick}>
            {inner}
         </Link>
      );

   return (
      <button onClick={handleClick} className={cls}>
         {inner}
      </button>
   );
}
