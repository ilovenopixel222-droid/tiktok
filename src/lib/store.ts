/**
 * Simple in-memory store for video processing jobs, clips, and videos.
 * In production, this would be replaced with a database (Supabase/PostgreSQL).
 */

export interface VideoRecord {
  id: string;
  title: string;
  source: string;
  duration: string;
  size: string;
  clips: number;
  date: string;
  status: "queued" | "processing" | "processed" | "failed";
  url?: string;
  filePath?: string;
}

export interface ClipRecord {
  id: string;
  videoId: string;
  title: string;
  viralScore: number;
  views: number;
  likes: number;
  comments: number;
  status: "processing" | "ready" | "published" | "scheduled" | "draft";
  platform: string;
  duration: string;
  moment: string;
  date: string;
  thumbnail: string;
  transcriptSegment?: string;
  startTime?: number;
  endTime?: number;
  sourceUrl?: string;
}

export interface JobRecord {
  id: string;
  videoId: string;
  title: string;
  progress: number;
  clipsFound: number;
  status: string;
  createdAt: string;
}

export interface TranscriptMoment {
  text: string;
  start: number;
  end: number;
  type: string;
  confidence: number;
  viralScore: number;
}

class InMemoryStore {
  private videos: Map<string, VideoRecord> = new Map();
  private clips: Map<string, ClipRecord> = new Map();
  private jobs: Map<string, JobRecord> = new Map();

  addVideo(video: VideoRecord): void {
    this.videos.set(video.id, video);
  }

  getVideo(id: string): VideoRecord | undefined {
    return this.videos.get(id);
  }

  getAllVideos(): VideoRecord[] {
    return Array.from(this.videos.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  updateVideo(id: string, updates: Partial<VideoRecord>): void {
    const video = this.videos.get(id);
    if (video) {
      this.videos.set(id, { ...video, ...updates });
    }
  }

  addClip(clip: ClipRecord): void {
    this.clips.set(clip.id, clip);
  }

  getClip(id: string): ClipRecord | undefined {
    return this.clips.get(id);
  }

  getAllClips(): ClipRecord[] {
    return Array.from(this.clips.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getClipsByVideo(videoId: string): ClipRecord[] {
    return Array.from(this.clips.values()).filter(c => c.videoId === videoId);
  }

  addJob(job: JobRecord): void {
    this.jobs.set(job.id, job);
  }

  getJob(id: string): JobRecord | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): JobRecord[] {
    return Array.from(this.jobs.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getActiveJobs(): JobRecord[] {
    return this.getAllJobs().filter(j => j.progress < 100);
  }

  updateJob(id: string, updates: Partial<JobRecord>): void {
    const job = this.jobs.get(id);
    if (job) {
      this.jobs.set(id, { ...job, ...updates });
    }
  }

  removeJob(id: string): void {
    this.jobs.delete(id);
  }
}

// Singleton instance
const globalStore = globalThis as unknown as { __clipviralStore?: InMemoryStore };
if (!globalStore.__clipviralStore) {
  globalStore.__clipviralStore = new InMemoryStore();
}
export const store: InMemoryStore = globalStore.__clipviralStore;
