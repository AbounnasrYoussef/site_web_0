export const CURRENT_YEAR = new Date().getFullYear();
export const BIRTH_YEARS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => String(CURRENT_YEAR - i));

export const DIPLOMA_LEVELS = [
  { value: '12', labelKey: 'bac' },
  { value: '14', labelKey: 'bacPlus2' },
  { value: '15', labelKey: 'bacPlus3' },
  { value: '17', labelKey: 'bacPlus5' },
  { value: '20', labelKey: 'doctorate' },
];

// Category icons
import AgricultureIcon from '@/public/icons/auth/categories/AgricultureIcon';
import CommunicationIcon from '@/public/icons/auth/categories/CommunicationIcon';
import DefenseIcon from '@/public/icons/auth/categories/DefenseIcon';
import EconomyIcon from '@/public/icons/auth/categories/EconomyIcon';
import EducationIcon from '@/public/icons/auth/categories/EducationIcon';
import HealthIcon from '@/public/icons/auth/categories/HealthIcon';
import IslamIcon from '@/public/icons/auth/categories/IslamIcon';
import MarineIcon from '@/public/icons/auth/categories/MarineIcon';
import ScienceIcon from '@/public/icons/auth/categories/ScienceIcon';
import SportIcon from '@/public/icons/auth/categories/SportIcon';
import TourismeIcon from '@/public/icons/auth/categories/TourismeIcon';
import UrbanismeIcon from '@/public/icons/auth/categories/UrbanismeIcon';

export const categoryIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'AGRICULTURE_ENVIRONMENT_SUSTAINABLE': AgricultureIcon,
  'DEFENSE_SECURITY': DefenseIcon,
  'ECONOMICS_TRADE_MANAGEMENT': EconomyIcon,
  'EDUCATION_TEACHING': EducationIcon,
  'ISLAMIC_SCIENCES': IslamIcon,
  'LANGUAGES_CULTURE_ARTS_SOCIAL': CommunicationIcon,
  'MARITIME': MarineIcon,
  'MEDICAL_PARAMEDICAL': HealthIcon,
  'SCIENCE_TECHNOLOGY_ENGINEERING': ScienceIcon,
  'SPORTS_PHYSICAL_EDUCATION': SportIcon,
  'TOURISM_HOSPITALITY': TourismeIcon,
  'URBAN_PLANNING_PUBLIC_WORKS_LOGISTICS': UrbanismeIcon,
};