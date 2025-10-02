import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Station {
  id: number;
  nameAr: string;
  nameEn: string;
  status: 'completed' | 'active' | 'pending';
}

interface StationProgressProps {
  stations: Station[];
}

export default function StationProgress({ stations }: StationProgressProps) {
  const { language } = useLanguage();

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" style={{ zIndex: 0 }} />
        
        {stations.map((station, index) => {
          const isCompleted = station.status === 'completed';
          const isActive = station.status === 'active';
          
          return (
            <div key={station.id} className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isActive
                    ? 'bg-background border-primary text-primary'
                    : 'bg-background border-border text-muted-foreground'
                }`}
                data-testid={`station-indicator-${station.id}`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : station.id}
              </div>
              
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {language === 'ar' ? station.nameAr : station.nameEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
