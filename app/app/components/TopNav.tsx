"use client";
import { useState } from "react";
import { Bell, UserCircle, Menu } from "lucide-react";

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TopNav({ searchQuery, onSearchChange }: TopNavProps) {
  return (
    <header className="topnav">
      <div className="topnav-left">
        <button className="topnav-menu-btn">
          <Menu size={20} />
        </button>
        <div className="topnav-search">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="topnav-search-input"
          />
        </div>
      </div>
      <div className="topnav-right">
        <button className="topnav-icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="topnav-badge">3</span>
        </button>
        <div className="topnav-avatar">
          <UserCircle size={28} />
        </div>
      </div>
    </header>
  );
}