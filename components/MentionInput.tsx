'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

type User = { id: number; email: string; display_name?: string };

type MentionInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isTextarea?: boolean;
  users: User[];
};

export default function MentionInput({
  value,
  onChange,
  placeholder,
  className,
  isTextarea = false,
  users,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value;
    const pos = e.currentTarget.selectionStart || 0;

    onChange(newValue);
    setCursorPos(pos);

    // Check if @ was just typed
    const lastChar = newValue[pos - 1];
    if (lastChar === '@') {
      setShowSuggestions(true);
      setSuggestions(users);
    } else if (lastChar === ' ' || lastChar === '\n') {
      setShowSuggestions(false);
    } else if (showSuggestions) {
      // Filter suggestions based on what's typed after @
      const beforeCursor = newValue.substring(0, pos);
      const lastAtIndex = beforeCursor.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const searchText = beforeCursor.substring(lastAtIndex + 1).toLowerCase();
        const filtered = users.filter(
          u => u.email.toLowerCase().includes(searchText) ||
               u.display_name?.toLowerCase().includes(searchText)
        );
        setSuggestions(filtered);
      }
    }
  };

  const insertMention = (user: User) => {
    const beforeCursor = value.substring(0, cursorPos);
    const afterCursor = value.substring(cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const before = beforeCursor.substring(0, lastAtIndex);
      const newValue = `${before}@${user.email} ${afterCursor}`;
      onChange(newValue);
      setShowSuggestions(false);

      // Focus input and move cursor
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newPos = before.length + user.email.length + 2;
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  const Element = isTextarea ? 'textarea' : 'input';

  return (
    <div style={{ position: 'relative' }}>
      <Element
        ref={inputRef as any}
        type={isTextarea ? undefined : 'text'}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className || 'input'}
        style={{ position: 'relative', zIndex: 1 }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 50,
            marginTop: 4,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          {suggestions.map(user => (
            <div
              key={user.id}
              onClick={() => insertMention(user)}
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--line)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--grad)',
                  color: '#07090d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {(user.display_name || user.email)[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                  {user.display_name || user.email.split('@')[0]}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {user.email}
                </div>
              </div>
              <Icon id="plus" size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
