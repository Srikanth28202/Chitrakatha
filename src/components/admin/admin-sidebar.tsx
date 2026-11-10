'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CreditCard,
  ExternalLink,
  Feather,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Settings,
  ShoppingBag,
  Tags,
  Truck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { LogoutButton } from '@/components/admin/logout-button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Editions', href: '/admin/editions', icon: BookOpen },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Shipments', href: '/admin/shipments', icon: Truck },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: RefreshCw },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Coupons', href: '/admin/coupons', icon: Tags },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  admin: {
    name: string;
    email: string;
  };
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function isActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <div className="w-full lg:w-64 lg:shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls="admin-sidebar"
        className="flex w-full items-center justify-between rounded-warm border border-border bg-white px-4 py-3 text-sm font-semibold text-espresso-main shadow-subtle lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          {isOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
          Admin menu
        </span>
        <span className="text-xs font-normal text-espresso-soft">Chitrakatha</span>
      </button>

      <aside
        id="admin-sidebar"
        className={cn(
          'mt-3 rounded-warm border border-border bg-white shadow-card lg:mt-0 lg:sticky lg:top-24',
          isOpen ? 'block' : 'hidden lg:block'
        )}
      >
        <div className="border-b border-border-subtle px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-paper border border-terracotta-200 bg-terracotta-50 text-terracotta-700">
              <Feather className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-lg font-semibold leading-tight text-espresso-dark">
                Chitrakatha
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso-soft">
                Admin Studio
              </p>
            </div>
          </div>
        </div>

        <nav className="p-3" aria-label="Admin navigation">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-paper px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-terracotta-50 text-terracotta-700'
                      : 'text-espresso-muted hover:bg-canvas-paper hover:text-espresso-main'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>

        </nav>

        <div className="border-t border-border-subtle p-4">
          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-semibold text-espresso-main">
              {admin.name || 'Administrator'}
            </p>
            <p className="truncate text-xs text-espresso-soft">{admin.email}</p>
          </div>
          <LogoutButton />
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-espresso-soft transition-colors hover:text-terracotta-700"
          >
            View website
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
