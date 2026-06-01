/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatHistoryRecord {
  id: string;
  title: string;
  time: string;
  preview: string;
  restoreLabel: string;
  messages: {
    sender: 'user' | 'system' | 'bot';
    text: string;
    isHtml?: boolean;
    isTaskCluster?: boolean;
    tasks?: { title: string; desc: string; agent: string }[];
  }[];
}

export interface VersionRecord {
  name: string;
  version: string;
  desc: string;
}

export interface ResourceSection {
  id: string;
  title: string;
  items: string[];
}

export type TabType = 'script' | 'map' | 'knowledge' | 'action' | 'skill' | 'persona' | 'voice';

export interface SkillSectionContent {
  title: string;
  sub: string;
  markdown?: string;
  html?: string;
}
