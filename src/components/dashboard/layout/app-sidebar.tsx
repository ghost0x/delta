'use client';

import * as React from 'react';
import {
  IconClipboardText,
  IconPackage,
  IconCategory,
  IconUsers,
  IconReport,
  IconInnerShadowTop
} from '@tabler/icons-react';

import { NavMain } from '@/components/dashboard/layout/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import Link from 'next/link';

const data = {
  navMain: [
    {
      title: 'Requirements',
      url: '/dashboard',
      icon: IconClipboardText
    },
    {
      title: 'Releases',
      url: '/dashboard/releases',
      icon: IconPackage
    },
    {
      title: 'Domains',
      url: '/dashboard/domains',
      icon: IconCategory
    },
    {
      title: 'Roles',
      url: '/dashboard/roles',
      icon: IconUsers
    },
    {
      title: 'Reports',
      url: '/dashboard/reports',
      icon: IconReport
    }
  ]
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:p-1.5!'
            >
              <Link href='/dashboard'>
                <IconInnerShadowTop className='size-5!' />
                <span className='text-base font-semibold'>Baseline</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
