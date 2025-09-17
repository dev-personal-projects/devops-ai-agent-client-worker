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
import { FaMicrosoft } from "react-icons/fa";

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
        }
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
