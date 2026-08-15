import React from 'react';
import Link from '@docusaurus/Link';
import type { Member } from '@site/src/data/fossMembers';

const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  borderRadius: 4,
  color: '#8b949e',
  transition: 'color 0.15s',
};

export default function MemberCard({ member }: { member: Member }) {
  const photoUrl = member.github ? `https://github.com/${member.github}.png` : '/img/default-avatar.png';

  return (
    <div
      className="member-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Link
        to={member.github ? `https://github.com/${member.github}` : '#'}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div
          className="member-card__avatar"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#38bdf8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <img
            src={photoUrl}
            alt={member.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
        </div>
        <div className="member-card__info">
          <div className="member-card__name">{member.name}</div>
          <div className="member-card__role">{member.role}</div>
        </div>
      </Link>
      <div className="member-card__links">
        {member.github && (
          <a
            href={`https://github.com/${member.github}`}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e6edf3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8b949e'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        )}
        {member.linkedin && (
          <a
            href={`https://linkedin.com/in/${member.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e6edf3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8b949e'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        )}
        {member.fossunited && (
          <a
            href={`https://fossunited.org/u/${member.fossunited}`}
            target="_blank"
            rel="noopener noreferrer"
            title="FOSS United"
            style={iconBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e6edf3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8b949e'; }}
          >
            <svg width="14" height="11" viewBox="0 0 103 81" fill="currentColor"><path d="M18.672 41.8285H12.554V11.8813H27.5991V17.9993H18.672V23.784H27.5991V29.902H18.672V41.8285Z"/><path d="M36.5261 35.6867H42.3108V17.9993H36.5261V35.6867ZM33.3838 41.8285V38.8291H30.4081V14.857H33.3838V11.8813H45.4531V14.857H48.4288V38.8291H45.4531V41.8285H33.3838ZM30.5747 11.9766H33.3838V14.857H30.5747V11.9766ZM45.4531 11.8812H48.4288V14.8569H45.4531V11.8812ZM45.4531 38.829H48.4288V41.7332H45.4531V38.829ZM30.4081 38.829H33.3838V41.8284H30.4081V38.829Z"/><path d="M66.2828 41.8285H51.2378V35.6867H63.1405V29.902H54.2135V26.9264H51.2378V14.857H54.2135V11.8813H69.2585V17.9993H57.3558V23.784H66.2828V26.7597H69.2585V38.8291H66.2828V41.8285ZM51.4045 11.9766H54.2135V14.857H51.4045V11.9766ZM51.2378 26.9264H54.2135V29.902H51.2378V26.9264ZM66.2828 23.784H69.2585V26.7597H66.2828V23.784ZM66.2828 38.8291H69.2585V41.7333H66.2828V38.8291Z"/><path d="M87.1126 41.8285H72.0676V35.6867H83.9702V29.902H75.0432V26.9264H72.0676V14.857H75.0432V11.8813H90.0882V17.9993H78.1855V23.784H87.1126V26.7597H90.0882V38.8291H87.1126V41.8285ZM72.2342 11.9766H75.0432V14.857H72.2342V11.9766ZM72.0676 26.9264H75.0432V29.902H72.0676V26.9264ZM87.1126 23.784H90.0882V26.7597H87.1126V23.784ZM87.1126 38.8291H90.0882V41.7333H87.1126V38.8291Z"/><path d="M14.7031 69.1866V67.0154H12.5526V47.5087H16.9739V64.7407H21.1544V47.5087H25.5758V67.0154H23.4253V69.1866H14.7031ZM12.5526 67.0154H14.7031V69.1866H12.5526V67.0154ZM23.4253 67.0154H25.5758V69.1177H23.4253V67.0154Z"/><path d="M32.0272 69.1866H27.6058V47.5087H40.629V69.1866H36.2077V51.9373H32.0272V69.1866Z"/><path d="M47.0804 69.1866H42.6591V47.5087H47.0804V69.1866Z"/><path d="M57.8327 69.1866H53.4114V51.9373H49.1105V47.5087H62.1337V51.9373H57.8327V69.1866Z"/><path d="M75.0364 69.1866H64.1637V47.5087H75.0364V51.9373H68.5851V56.1247H75.0364V60.5533H68.5851V64.7407H75.0364V69.1866Z"/><path d="M81.4878 64.7407H85.6683V51.9373H81.4878V64.7407ZM77.0665 69.1866V47.5087H87.9392V49.6627H90.0882V64.7407H85.9077V51.9373H81.4878V69.1866H77.0665Z"/><path d="M18.672 41.8285H12.554V11.8813H27.5991V17.9993H18.672V23.784H27.5991V29.902H18.672V41.8285Z"/></svg>
          </a>
        )}
      </div>
    </div>
  );
}
