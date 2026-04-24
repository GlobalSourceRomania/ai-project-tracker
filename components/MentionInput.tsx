'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

type DropdownPos = { top: number; left: number; width: number };

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
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Recalculate dropdown position based on input's current bounding rect
  const updateDropdownPos = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  // Reposition dropdown on scroll / resize so it tracks the input
  useEffect(() => {
    if (!showSuggestions) return;
    updateDropdownPos();
    window.addEventListener('scroll', updateDropdownPos, true);
    window.addEventListener('resize', updateDropdownPos);
    return () => {
      window.removeEventListener('scroll', updateDropdownPos, true);
      window.removeEventListener('resize', updateDropdownPos);
    };
  }, [showSuggestions, updateDropdownPos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value;
    const pos = e.currentTarget.selectionStart || 0;

    onChange(newValue);
    setCursorPos(pos);

    const lastChar = newValue[pos - 1];
    if (lastChar === '@') {
      setShowSuggestions(true);
      setSuggestions(users);
      updateDropdownPos();
    } else if (lastChar === ' ' || lastChar === '\n') {
      setShowSuggestions(false);
    } else if (showSuggestions) {
      const beforeCursor = newValue.substring(0, pos);
      const lastAtIndex = beforeCursor.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const searchText = beforeCursor.substring(lastAtIndex + 1).toLowerCase();
        const filtered = users.filter(
          u =>
            u.email.toLowerCase().includes(searchText) ||
            u.display_name?.toLowerCase().includes(searchText),
        );
        setSuggestions(filtered);
        if (filtered.length === 0) setShowSuggestions(false);
      } else {
        setShowSuggestions(false);
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

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newPos = before.length + user.email.length + 2;
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  const Element = isTextarea ? 'textarea' : 'input';

  // Dropdown rendered as a portal so it's never clipped by overflow:hidden parents
  const dropdown =
    showSuggestions && suggestions.length > 0 && dropdownPos
      ? createPortal(
          <div
            style={{
              position: 'absolute',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              minWidth: 240,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              maxHeight: 220,
              overflowY: 'auto',
              zIndex: 99999,
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
            // Prevent blur on input when clicking dropdown items
            onMouseDown={(e) => e.preventDefault()}
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
                  transition: 'background .12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
                <Icon id="plus" size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              </div>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Element
        ref={inputRef as any}
        type={isTextarea ? undefined : 'text'}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        className={className || 'input'}
        style={{ width: '100%' }}
      />
      {dropdown}
    </div>
  );
}
