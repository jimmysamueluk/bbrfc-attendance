export interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  position?: string | null;
  registered?: boolean;
  teamId?: number | null;
  team?: Team | null;
}

export interface Team {
  id: number;
  name: string;
  ageGroup?: string | null;
  coachId?: number | null;
}

export interface SessionPlayerAward {
  id: number;
  sessionId: number;
  playerId: number;
  player: { id: number; firstName: string; lastName: string };
}

export interface TrainingSession {
  id: number;
  sessionDate: string;
  sessionTime?: string | null;
  sessionType?: string | null;
  description?: string | null;
  duration?: number | null;
  intensity?: number | null;
  playerOfSessionId?: number | null;
  playerOfSession?: { id: number; firstName: string; lastName: string } | null;
  playerAwards?: SessionPlayerAward[];
  team?: Team | null;
  coach?: { id: number; firstName: string; lastName: string };
  attendees?: TrainingAttendance[];
}

export interface TrainingAttendance {
  id: number;
  sessionId: number;
  playerId: number;
  present: boolean;
  player: {
    id: number;
    firstName: string;
    lastName: string;
    position?: string | null;
    registered?: boolean;
  };
}

export interface AttendanceRecord {
  playerId: number;
  present: boolean;
}

export interface PlayerStats {
  player: { id: number; firstName: string; lastName: string };
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
}

export interface PlayerOfSessionStats {
  player: { id: number; firstName: string; lastName: string };
  awardCount: number;
}

export interface LoginResponse {
  user: User;
  token: string;
}
