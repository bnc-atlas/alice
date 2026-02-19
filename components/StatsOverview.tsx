'use client'

import { type ContentWithDetails } from '@/lib/supabase'
import { BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react'

interface StatsOverviewProps {
  content: ContentWithDetails[]
}

export default function StatsOverview({ content }: StatsOverviewProps) {
  const stats = {
    total: content.length,
    toRead: content.filter(c => c.status === 'to_read').length,
    inProgress: content.filter(c => c.status === 'in_progress').length,
    completed: content.filter(c => c.status === 'completed').length,
  }

  const thisWeek = content.filter(c => {
    const created = new Date(c.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return created > weekAgo
  }).length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard
        icon={BookOpen}
        label="Total"
        value={stats.total}
        gradient="from-blue-500 to-cyan-500"
      />
      <StatCard
        icon={Clock}
        label="To Read"
        value={stats.toRead}
        gradient="from-yellow-500 to-orange-500"
      />
      <StatCard
        icon={TrendingUp}
        label="Reading"
        value={stats.inProgress}
        gradient="from-purple-500 to-pink-500"
      />
      <StatCard
        icon={CheckCircle2}
        label="Completed"
        value={stats.completed}
        gradient="from-green-500 to-emerald-500"
      />
      <StatCard
        icon={TrendingUp}
        label="This Week"
        value={thisWeek}
        gradient="from-indigo-500 to-blue-500"
      />
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  gradient 
}: { 
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  gradient: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm 
                    border border-border/50 p-4 group hover:border-primary/30 
                    transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 
                       group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} 
                        flex items-center justify-center mb-3 group-hover:scale-110 
                        transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        <div className="text-3xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/60 
                        bg-clip-text text-transparent">
          {value}
        </div>
        
        <div className="text-xs text-muted-foreground font-medium">
          {label}
        </div>
      </div>
    </div>
  )
}
