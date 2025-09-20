"use client";

import * as React from "react";
import {
  Bot,
  GalleryVerticalEnd,
  Settings2,
  MessageCircleCode,
  LucideGithub,
  Settings,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUserContext } from "@/components/user-provider";

const data = {
  teams: [
    {
      name: "Devops AI Agent",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Chat",
      url: "#",
      icon: MessageCircleCode,
      isActive: true,
      items: [
        {
          title: "New Chat",
          url: "#",
        },
        {
          title: " Chat History",
          url: "#",
        },
      ],
    },
    {
      title: "Analysis",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Codebase Analysis",
          url: "#",
        },
        {
          title: "Infrastructure Analysis",
          url: "#",
        },
        {
          title: "Recommendations & Insights",
          url: "#",
        },
      ],
    },
    {
      title: "Deployments",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "New Deployment",
          url: "#",
        },
        {
          title: " Manage Deployments",
          url: "#",
        },
        {
          title: "Deployment Logs",
          url: "#",
        },
        {
          title: "Deployment Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Github Central",
      url: "#",
      icon: LucideGithub,
      items: [
        {
          title: "Repositories",
          url: "#",
        },
        {
          title: "Organizations",
          url: "#",
        },
        {
          title: "Pull Requests",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userId } = useUserContext();

  const userNavData = React.useMemo(
    () => ({
      teams: data.teams,
      navMain: data.navMain.map((item) => ({
        ...item,
        items: item.items?.map((subItem) => ({
          ...subItem,
          url:
            subItem.url !== "#"
              ? subItem.url
              : `/${userId}${getNavUrl(item.title, subItem.title)}`,
        })),
      })),
    }),
    [userId]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={userNavData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={userNavData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function getNavUrl(mainTitle: string, subTitle: string): string {
  const routes: Record<string, Record<string, string>> = {
    Chat: {
      "New Chat": "/dashboard",
      " Chat History": "/dashboard/chat-history",
    },
    Analysis: {
      "Codebase Analysis": "/codebase-scan-analysis",
      "Infrastructure Analysis": "/infrastructure-analysis",
      Recommendations: "/recommendations-analysis",
    },
    Deployment: {
      "New Deployment": "/deployments/new",
      " Manage Deployments": "/deployments",
      "Deployment Logs": "/deployments/logs",
      "Deployment Settings": "/deployments/settings",
    },
    "Github Central": {
      Repositories: "/(github)/repositories",
      Organizations: "/(github)/organizations",
      "Pull Requests": "/(github)/pull-requests",
    },
    Settings: {
      General: "/settings/general",
      Team: "/settings/team",
      Billing: "/settings/billing",
    },
  };

  return routes[mainTitle]?.[subTitle] || "/dashboard";
}
