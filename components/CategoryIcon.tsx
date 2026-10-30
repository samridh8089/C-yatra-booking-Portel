import React from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, className = "w-5 h-5", size, ...props }: CategoryIconProps) {
  // Normalize icon name: e.g. "Plane" -> Plane, "bed-double" -> BedDouble
  const formattedName = name
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/^([a-z])/, (_, char) => char.toUpperCase());

  // Map known names to Lucide icons
  const iconMap: Record<string, LucideIcon> = {
    Plane: LucideIcons.Plane,
    Users: LucideIcons.Users,
    Bed: LucideIcons.Bed,
    BedDouble: LucideIcons.BedDouble,
    Hotel: LucideIcons.Hotel,
    Car: LucideIcons.Car,
    Home: LucideIcons.Home,
    Building: LucideIcons.Building,
    Building2: LucideIcons.Building2,
    Store: LucideIcons.Store,
    Bus: LucideIcons.Bus,
    Train: LucideIcons.Train,
    TrainFront: LucideIcons.TrainFront,
    Globe: LucideIcons.Globe,
    Shield: LucideIcons.Shield,
    ShieldCheck: LucideIcons.ShieldCheck,
    Compass: LucideIcons.Compass,
    Luggage: LucideIcons.Luggage,
    Palmtree: LucideIcons.Palmtree,
    MapPin: LucideIcons.MapPin,
    Tag: LucideIcons.Tag,
    Bookmark: LucideIcons.Bookmark,
  };

  const IconComponent = iconMap[formattedName] || (LucideIcons as any)[formattedName] || LucideIcons.Compass;

  return <IconComponent className={className} size={size} {...props} />;
}
