import React from 'react';
import MemberCard from '../MemberCard';
import { sortedMembers } from '@site/src/data/fossMembers';

interface MembersGridProps {
  /** If true, show only core members. Default: show all. */
  coreOnly?: boolean;
}

export default function MembersGrid({ coreOnly = false }: MembersGridProps) {
  const displayMembers = coreOnly
    ? sortedMembers.filter((m) => m.isCore)
    : sortedMembers;

  return (
    <div className="members-grid">
      {displayMembers.map((member) => (
        <MemberCard key={member.slug} member={member} />
      ))}
    </div>
  );
}
