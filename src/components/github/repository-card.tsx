'use client';

import { Repository, RepositoryVisibility } from "@/types/github/repositories/repositories";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  GitFork, 
  Eye, 
  Lock, 
  Globe, 
  ExternalLink,
  Calendar,
  Code
} from "lucide-react";
import Link from "next/link";

interface RepositoryCardProps {
  repository: Repository;
  userId: string;
  className?: string;
}

export function RepositoryCard({ repository, userId, className }: RepositoryCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVisibilityIcon = () => {
    return repository.visibility === RepositoryVisibility.PRIVATE ? (
      <Lock className="h-4 w-4" />
    ) : (
      <Globe className="h-4 w-4" />
    );
  };

  const getVisibilityColor = () => {
    return repository.visibility === RepositoryVisibility.PRIVATE 
      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
      : "bg-green-500/10 text-green-600 dark:text-green-400";
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/${userId}/repositories/${repository.name}`}
              className="block"
            >
              <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {repository.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              {repository.owner.login}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Badge 
              variant="outline" 
              className={`text-xs ${getVisibilityColor()}`}
            >
              {getVisibilityIcon()}
              <span className="ml-1 capitalize">{repository.visibility}</span>
            </Badge>
            
            <Button 
              variant="ghost" 
              size="sm"
              asChild
            >
              <a 
                href={repository.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {repository.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {repository.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{repository.stats.stars}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              <span>{repository.stats.forks}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{repository.stats.watchers}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {repository.language && (
              <div className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                <span>{repository.language}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(repository.updated_at)}</span>
            </div>
          </div>
        </div>

        {repository.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {repository.topics.slice(0, 3).map((topic) => (
              <Badge 
                key={topic} 
                variant="secondary" 
                className="text-xs px-2 py-1"
              >
                {topic}
              </Badge>
            ))}
            {repository.topics.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{repository.topics.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}