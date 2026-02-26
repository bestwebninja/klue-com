import React from 'npm:react@18.3.1';

// Brand colors
export const colors = {
  primary: '#10b981', // Green for homeowner-focused
  primaryDark: '#059669',
  secondary: '#3b82f6', // Blue for provider-focused
  secondaryDark: '#1d4ed8',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#92400e',
  success: '#22c55e',
  successLight: '#f0fdf4',
  successDark: '#166534',
  info: '#3b82f6',
  infoLight: '#eff6ff',
  infoDark: '#1e40af',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  background: '#f4f4f5',
};

// Shared styles
export const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    backgroundColor: colors.background,
  },
  container: {
    margin: '0 auto',
    backgroundColor: colors.white,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  text: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    color: colors.gray[700],
    lineHeight: '1.6',
  },
  heading: {
    margin: 0,
    color: colors.white,
    fontSize: '28px',
    fontWeight: '700',
  },
  subheading: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    color: colors.gray[900],
    fontWeight: '600',
  },
};

interface EmailLayoutProps {
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ children }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${colors.background};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.background};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: ${colors.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          ${children}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

interface EmailHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'homeowner' | 'provider';
}

export const EmailHeader = ({ title, subtitle, variant = 'homeowner' }: EmailHeaderProps): string => {
  const gradient = variant === 'provider' 
    ? `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryDark} 100%)`
    : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`;
  
  return `
    <tr>
      <td style="background: ${gradient}; padding: 40px 40px 30px 40px; text-align: center;">
        <h1 style="margin: 0; color: ${colors.white}; font-size: 28px; font-weight: 700;">${title}</h1>
        ${subtitle ? `<p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${subtitle}</p>` : ''}
      </td>
    </tr>
  `;
};

interface EmailFooterProps {
  text: string;
}

export const EmailFooter = ({ text }: EmailFooterProps): string => `
  <tr>
    <td style="background-color: ${colors.gray[50]}; padding: 25px 40px; text-align: center; border-top: 1px solid ${colors.gray[200]};">
      <p style="margin: 0; font-size: 12px; color: ${colors.gray[400]};">
        ${text}
      </p>
    </td>
  </tr>
`;

interface EmailButtonProps {
  href: string;
  text: string;
  variant?: 'primary' | 'secondary' | 'outline';
  color?: 'homeowner' | 'provider';
}

export const EmailButton = ({ href, text, variant = 'primary', color = 'homeowner' }: EmailButtonProps): string => {
  const gradientColors = color === 'provider' 
    ? { start: colors.secondary, end: colors.secondaryDark }
    : { start: colors.primary, end: colors.primaryDark };
  
  if (variant === 'outline') {
    return `
      <a href="${href}" 
         style="display: inline-block; padding: 12px 30px; background-color: ${colors.gray[100]}; color: ${colors.gray[700]}; text-decoration: none; font-weight: 500; font-size: 14px; border-radius: 8px; border: 1px solid ${colors.gray[200]};">
        ${text}
      </a>
    `;
  }
  
  return `
    <a href="${href}" 
       style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%); color: ${colors.white}; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
      ${text}
    </a>
  `;
};

interface StepItem {
  title: string;
  description: string;
}

interface EmailStepsProps {
  steps: StepItem[];
  color?: 'homeowner' | 'provider';
}

export const EmailSteps = ({ steps, color = 'homeowner' }: EmailStepsProps): string => {
  const stepColor = color === 'provider' ? colors.secondary : colors.primary;
  
  const stepsHtml = steps.map((step, index) => {
    const isLast = index === steps.length - 1;
    return `
      <tr>
        <td style="padding: 15px 0;${!isLast ? ` border-bottom: 1px solid ${colors.gray[200]};` : ''}">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="40" valign="top">
                <span style="display: inline-block; width: 28px; height: 28px; background-color: ${stepColor}; color: ${colors.white}; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px;">${index + 1}</span>
              </td>
              <td style="padding-left: 15px;">
                <p style="margin: 0; font-size: 15px; color: ${colors.gray[700]}; font-weight: 500;">${step.title}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: ${colors.gray[500]};">${step.description}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
      ${stepsHtml}
    </table>
  `;
};

interface TipBoxProps {
  title: string;
  items: string[];
  variant?: 'info' | 'warning' | 'success';
  intro?: string;
}

export const EmailTipBox = ({ title, items, variant = 'info', intro }: TipBoxProps): string => {
  const variantStyles = {
    info: { bg: colors.infoLight, border: colors.info, titleColor: colors.infoDark, textColor: '#1e3a8a' },
    warning: { bg: colors.warningLight, border: colors.warning, titleColor: colors.warningDark, textColor: '#78350f' },
    success: { bg: colors.successLight, border: colors.success, titleColor: colors.successDark, textColor: '#15803d' },
  };
  
  const style = variantStyles[variant];
  
  const itemsHtml = items.map((item, index) => {
    const isLast = index === items.length - 1;
    return `<li style="margin-bottom: ${isLast ? '0' : '12px'}; font-size: 14px;">${item}</li>`;
  }).join('');
  
  return `
    <div style="background-color: ${style.bg}; border-radius: 8px; padding: 25px; margin-bottom: 30px; border-left: 4px solid ${style.border};">
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: ${style.titleColor}; font-weight: 600;">${title}</h2>
      ${intro ? `<p style="margin: 0 0 15px 0; font-size: 14px; color: ${style.textColor}; line-height: 1.6;">${intro}</p>` : ''}
      <ul style="margin: 0; padding-left: 20px; color: ${style.textColor};">
        ${itemsHtml}
      </ul>
    </div>
  `;
};

interface JobSummaryProps {
  title: string;
  category: string;
  location?: string;
  budget: string;
}

export const EmailJobSummary = ({ title, category, location, budget }: JobSummaryProps): string => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.gray[50]}; border-radius: 8px; margin-bottom: 30px;">
    <tr>
      <td style="padding: 25px;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: ${colors.gray[900]}; font-weight: 600;">${title}</h3>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: ${colors.gray[500]};">
          <strong>Category:</strong> ${category}
        </p>
        ${location ? `<p style="margin: 0 0 10px 0; font-size: 14px; color: ${colors.gray[500]};"><strong>Location:</strong> ${location}</p>` : ''}
        <p style="margin: 0; font-size: 14px; color: ${colors.gray[500]};">
          <strong>Budget:</strong> ${budget}
        </p>
      </td>
    </tr>
  </table>
`;

// Helper to wrap content section
export const EmailContent = (content: string): string => `
  <tr>
    <td style="padding: 40px;">
      ${content}
    </td>
  </tr>
`;

// Helper for greeting
export const EmailGreeting = (name: string): string => `
  <p style="margin: 0 0 20px 0; font-size: 16px; color: ${colors.gray[700]}; line-height: 1.6;">
    Hi ${name},
  </p>
`;

// Helper for paragraph
export const EmailParagraph = (text: string): string => `
  <p style="margin: 0 0 25px 0; font-size: 16px; color: ${colors.gray[700]}; line-height: 1.6;">
    ${text}
  </p>
`;

// Helper for section heading
export const EmailSectionHeading = (text: string): string => `
  <h2 style="margin: 0 0 20px 0; font-size: 20px; color: ${colors.gray[900]}; font-weight: 600;">${text}</h2>
`;

// Helper for centered button container
export const EmailButtonContainer = (buttons: string[], spacing: 'tight' | 'normal' = 'normal'): string => {
  const padding = spacing === 'tight' ? '0 0 15px 0' : '10px 0 30px 0';
  return buttons.map((button, index) => `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="text-align: center; padding: ${index === 0 ? padding : '0 0 20px 0'};">
          ${button}
        </td>
      </tr>
    </table>
  `).join('');
};

// Helper for closing message
export const EmailClosing = (text: string = "Questions? Reply to this email and we'll be happy to help!"): string => `
  <p style="margin: 0; font-size: 14px; color: ${colors.gray[500]}; line-height: 1.6; text-align: center;">
    ${text}
  </p>
`;

// Complete email builder
interface BuildEmailOptions {
  header: { title: string; subtitle?: string; variant?: 'homeowner' | 'provider' };
  greeting: string;
  intro: string;
  sections: string[];
  buttons: { href: string; text: string; variant?: 'primary' | 'outline'; color?: 'homeowner' | 'provider' }[];
  footer: string;
  closing?: string;
}

export const buildEmail = (options: BuildEmailOptions): string => {
  const { header, greeting, intro, sections, buttons, footer, closing } = options;
  
  const buttonHtml = buttons.map(btn => 
    EmailButton({ href: btn.href, text: btn.text, variant: btn.variant || 'primary', color: btn.color || header.variant })
  );
  
  const content = `
    ${EmailGreeting(greeting)}
    ${EmailParagraph(intro)}
    ${sections.join('')}
    ${EmailButtonContainer(buttonHtml)}
    ${EmailClosing(closing)}
  `;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${colors.background};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.background};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: ${colors.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          ${EmailHeader(header)}
          ${EmailContent(content)}
          ${EmailFooter({ text: footer })}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Info card for displaying key-value pairs
interface InfoCardItem {
  label: string;
  value: string;
  isLink?: boolean;
}

interface EmailInfoCardProps {
  title?: string;
  items: InfoCardItem[];
  variant?: 'default' | 'success' | 'highlight';
}

export const EmailInfoCard = ({ title, items, variant = 'default' }: EmailInfoCardProps): string => {
  const bgColor = variant === 'success' ? '#e8f5e9' : variant === 'highlight' ? colors.gray[50] : '#f9fafb';
  const borderColor = variant === 'success' ? colors.primary : variant === 'highlight' ? colors.primary : colors.gray[200];
  
  const itemsHtml = items.map((item, index) => {
    const isLast = index === items.length - 1;
    const valueHtml = item.isLink 
      ? `<a href="mailto:${item.value}" style="color: ${colors.primary};">${item.value}</a>`
      : item.value;
    return `<p style="margin: ${isLast ? '0' : '0 0 8px 0'}; font-size: 14px; color: ${colors.gray[500]};"><strong>${item.label}:</strong> ${valueHtml}</p>`;
  }).join('');
  
  return `
    <div style="background-color: ${bgColor}; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${borderColor};">
      ${title ? `<h3 style="margin: 0 0 12px 0; font-size: 16px; color: ${colors.gray[900]}; font-weight: 600;">${title}</h3>` : ''}
      ${itemsHtml}
    </div>
  `;
};

// Quote/message box for displaying user messages
export const EmailMessageBox = (message: string, title?: string): string => `
  <div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${colors.primary};">
    ${title ? `<h3 style="margin: 0 0 12px 0; font-size: 16px; color: ${colors.gray[900]}; font-weight: 600;">${title}</h3>` : ''}
    <p style="margin: 0; color: ${colors.gray[700]}; font-style: italic; white-space: pre-wrap;">${message}</p>
  </div>
`;

// Star rating display
export const EmailStarRating = (rating: number, size: 'small' | 'large' = 'small'): string => {
  const fontSize = size === 'large' ? '32px' : '20px';
  const stars = Array.from({ length: 5 }, (_, i) => 
    i < rating 
      ? `<span style="color: #f59e0b; font-size: ${fontSize};">★</span>` 
      : `<span style="color: #d1d5db; font-size: ${fontSize};">☆</span>`
  ).join('');
  return `<div style="margin: 12px 0;">${stars}</div>`;
};

// Simple list (ordered or unordered)
interface EmailListProps {
  items: string[];
  ordered?: boolean;
}

export const EmailList = ({ items, ordered = false }: EmailListProps): string => {
  const tag = ordered ? 'ol' : 'ul';
  const itemsHtml = items.map(item => 
    `<li style="margin-bottom: 8px; font-size: 14px; color: ${colors.gray[500]};">${item}</li>`
  ).join('');
  return `<${tag} style="margin: 0 0 20px 0; padding-left: 20px; color: ${colors.gray[500]}; line-height: 1.8;">${itemsHtml}</${tag}>`;
};

// Highlight box for important messages
interface EmailHighlightBoxProps {
  content: string;
  variant?: 'success' | 'warning' | 'info';
  icon?: string;
}

export const EmailHighlightBox = ({ content, variant = 'success', icon }: EmailHighlightBoxProps): string => {
  const styles = {
    success: { bg: '#e8f5e9', border: colors.primary, text: '#166534' },
    warning: { bg: colors.warningLight, border: colors.warning, text: colors.warningDark },
    info: { bg: colors.infoLight, border: colors.info, text: colors.infoDark },
  };
  const style = styles[variant];
  
  return `
    <div style="background-color: ${style.bg}; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${style.border};">
      <p style="margin: 0; color: ${style.text}; font-size: 14px; line-height: 1.6;">
        ${icon ? `<span style="margin-right: 8px;">${icon}</span>` : ''}${content}
      </p>
    </div>
  `;
};
