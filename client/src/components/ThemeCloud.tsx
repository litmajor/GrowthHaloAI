import React from "react";

interface ThemeCloudProps {
  userId: string;
}

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ThemeCloud: React.FC<ThemeCloudProps> = ({ userId }) => {
  const { data: themes, isLoading } = useQuery({
    queryKey: ['conversation-themes'],
    queryFn: async () => {
      const res = await fetch('/api/conversation-themes', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch themes');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">What You're Exploring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-20 inline-block mr-2"></div>
            <div className="h-6 bg-gray-200 rounded w-24 inline-block mr-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16 inline-block"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!themes || themes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">What You're Exploring</CardTitle>
          <CardDescription className="text-xs">
            Themes from your conversations will appear here
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">What You're Exploring</CardTitle>
        <CardDescription className="text-xs">
          Your most discussed topics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme: any) => (
            <Badge 
              key={theme.id}
              variant="secondary"
              className="cursor-pointer hover:bg-purple-100 transition-colors"
              style={{ 
                fontSize: `${Math.min(0.75 + (theme.frequency / 20), 1.2)}rem` 
              }}
            >
              {theme.theme}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeCloud;
