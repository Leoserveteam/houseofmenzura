'use client';

import { useRef, useState } from 'react';
import { countWords, limitWords, MAX_WORDS } from '@/lib/schema';
import { UploadIcon } from './icons';

type Common = { name: string; label: string; error?: string };
const ids = (name: string) => ({ id: `f-${name}`, err: `f-${name}-error`, hint: `f-${name}-hint` });
const describedBy = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(' ') || undefined;

export function ErrorText({ name, error }: { name: string; error?: string }) {
  return error ? (
    <p className="error" id={ids(name).err}>
      {error}
    </p>
  ) : null;
}

export function TextField({
  name,
  label,
  error,
  value,
  onChange,
  type = 'text',
  autoComplete,
  inputMode,
  placeholder,
}: Common & {
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  placeholder?: string;
}) {
  const i = ids(name);
  return (
    <div className="field" data-error={!!error}>
      <label className="field-label" htmlFor={i.id}>{label}</label>
      <input
        className="input"
        id={i.id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(error && i.err)}
      />
      <ErrorText name={name} error={error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  error,
  value,
  onChange,
  placeholder,
  options,
}: Common & { value: string; onChange: (v: string) => void; placeholder: string; options: readonly { value: string; label: string }[] }) {
  const i = ids(name);
  return (
    <div className="field" data-error={!!error}>
      <label className="field-label" htmlFor={i.id}>{label}</label>
      <select
        className="input select"
        id={i.id}
        name={name}
        value={value}
        data-empty={!value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(error && i.err)}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ErrorText name={name} error={error} />
    </div>
  );
}

/** Two radios beat a dropdown for a binary answer. */
export function ChoiceField({
  name,
  label,
  error,
  value,
  onChange,
  options,
  children,
}: Common & { value: string; onChange: (v: string) => void; options: readonly { value: string; label: string }[]; children?: React.ReactNode }) {
  const i = ids(name);
  return (
    <fieldset className="field" data-error={!!error} aria-describedby={describedBy(error && i.err)} style={{ gap: 12 }}>
      <legend className="field-label" style={{ marginBottom: 12 }}>{label}</legend>
      <div className="choice-options">
        {options.map((o, n) => (
          <label className="choice" key={o.value}>
            <input
              className="radio"
              type="radio"
              id={n === 0 ? i.id : undefined}
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              aria-invalid={!!error || undefined}
            />
            {o.label}
          </label>
        ))}
      </div>
      {children}
      <ErrorText name={name} error={error} />
    </fieldset>
  );
}

export function Checkbox({ name, error, checked, onChange, children }: { name: string; error?: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  const i = ids(name);
  return (
    <div className="field" data-error={!!error}>
      <label className="checkbox-row">
        <input
          className="check"
          type="checkbox"
          id={i.id}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy(error && i.err)}
        />
        <span>{children}</span>
      </label>
      <ErrorText name={name} error={error} />
    </div>
  );
}

/** Live word counter that stops input at 100 words. */
export function TextareaField({ name, label, error, value, onChange, optional = false }: Common & { value: string; onChange: (v: string) => void; optional?: boolean }) {
  const i = ids(name);
  const words = countWords(value);
  return (
    <div className="field" data-error={!!error}>
      <label className="field-label strong" htmlFor={i.id}>{label}</label>
      <textarea
        className="textarea"
        id={i.id}
        name={name}
        value={value}
        onChange={(e) => onChange(limitWords(e.target.value))}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(i.hint, error && i.err)}
      />
      <div className="meta-row" id={i.hint}>
        <span>{optional ? 'Optional, up to 100 words' : 'Up to 100 words'}</span>
        <span aria-live={words >= MAX_WORDS ? 'polite' : 'off'}>
          {words} / {MAX_WORDS}
        </span>
      </div>
      <ErrorText name={name} error={error} />
    </div>
  );
}

/** Drag or click. PDF only and 5 MB are stated before anything is chosen. */
export function UploadField({ name, label, note, error, file, onFile }: Common & { note: string; file: File | null; onFile: (f: File | null) => void }) {
  const i = ids(name);
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div className="field" data-error={!!error}>
      <span className="field-label" id={`${i.id}-label`}>{label}</span>
      <label
        className="drop"
        data-over={over}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        <input
          ref={input}
          className="sr-only"
          type="file"
          id={i.id}
          name={name}
          accept="application/pdf,.pdf"
          aria-labelledby={`${i.id}-label`}
          aria-describedby={describedBy(i.hint, error && i.err)}
          aria-invalid={!!error || undefined}
          onChange={(e) => {
            onFile(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
        <UploadIcon />
        <span className="drop-text" id={i.hint}>
          <span className="t-small-strong">{file ? file.name : 'Drop your resume here'}</span>
          <span className="t-meta muted">PDF only, up to 5 MB</span>
        </span>
        <span className="drop-action" aria-hidden="true">{file ? 'Choose another' : 'Choose file'}</span>
      </label>
      {file ? (
        <button type="button" className="link-button" style={{ alignSelf: 'flex-start' }} onClick={() => onFile(null)}>
          Remove file
        </button>
      ) : null}
      <p className="t-meta muted">{note}</p>
      <ErrorText name={name} error={error} />
    </div>
  );
}
