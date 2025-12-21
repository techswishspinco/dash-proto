import React from "react";
import Layout from "@/components/layout";

export default function GenericPage({ title }: { title: string }) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white border border-border shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <h1 className="font-serif text-3xl font-medium mb-4">{title}</h1>
          <p className="text-muted-foreground max-w-md">
            This module is currently under development. Check back soon for updates.
          </p>
          <div className="mt-8 px-4 py-2 bg-secondary/50 rounded-full text-xs font-mono text-muted-foreground border border-border">
            Status: Development Preview
          </div>
        </div>
      </div>
  );
}
