import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Kluje'
const SITE_URL = 'https://kluje.lovable.app'

interface ProviderWelcomeProps {
  name?: string
}

const ProviderWelcomeEmail = ({ name }: ProviderWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME}! Here's how to get hired</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>🎉 Welcome to {SITE_NAME}!</Heading>
          <Text style={subtitle}>You're now part of our service provider community</Text>
        </Section>

        <Text style={text}>
          Hi {name || 'there'},
        </Text>
        <Text style={text}>
          Congratulations on joining {SITE_NAME}! You're now connected to homeowners looking for quality service providers like you.
        </Text>

        <Hr style={hr} />

        <Heading as="h2" style={h2}>🚀 Getting Started</Heading>
        <Text style={text}>
          <strong>1. Complete your profile</strong> — Add a professional photo, write a compelling bio, and list your qualifications.
        </Text>
        <Text style={text}>
          <strong>2. Browse available jobs</strong> — Check the jobs page to see homeowner requests matching your services and location.
        </Text>
        <Text style={text}>
          <strong>3. Send quote requests</strong> — Express interest in jobs you can complete well. Quality over quantity wins!
        </Text>
        <Text style={text}>
          <strong>4. Build your reputation</strong> — Complete jobs successfully and collect 5-star reviews to stand out.
        </Text>

        <Hr style={hr} />

        <Heading as="h2" style={h2}>💡 Top Tips for Getting Hired</Heading>
        <Text style={text}>
          • <strong>Respond quickly</strong> — Homeowners often choose the first professional who responds.
        </Text>
        <Text style={text}>
          • <strong>Be transparent about pricing</strong> — Give clear estimates upfront. Hidden costs lose trust.
        </Text>
        <Text style={text}>
          • <strong>Get verified</strong> — Complete our verification process to display the verified badge and rank higher.
        </Text>
        <Text style={text}>
          • <strong>Ask for reviews</strong> — After completing a job, politely ask satisfied customers to leave a review.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={`${SITE_URL}/dashboard`}>
            Go to Your Dashboard
          </Button>
        </Section>
        <Section style={buttonContainer}>
          <Button style={outlineButton} href={`${SITE_URL}/jobs`}>
            Browse Available Jobs
          </Button>
        </Section>

        <Text style={footer}>
          Best regards,{'\n'}The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ProviderWelcomeEmail,
  subject: `Welcome to ${SITE_NAME}! 🎉 Here's how to get hired`,
  displayName: 'Provider welcome',
  previewData: { name: 'John' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Open Sans', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '580px', margin: '0 auto' }
const headerSection = { backgroundColor: 'hsl(38, 92%, 55%)', padding: '24px', borderRadius: '8px 8px 0 0', textAlign: 'center' as const, marginBottom: '24px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px' }
const subtitle = { fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: '0' }
const h2 = { fontSize: '18px', fontWeight: 'bold', color: 'hsl(220, 13%, 18%)', margin: '24px 0 12px' }
const text = { fontSize: '14px', color: 'hsl(220, 9%, 46%)', lineHeight: '1.6', margin: '0 0 12px' }
const hr = { borderColor: 'hsl(220, 13%, 91%)', margin: '24px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '8px 0' }
const button = { backgroundColor: 'hsl(38, 92%, 55%)', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }
const outlineButton = { backgroundColor: 'transparent', color: 'hsl(38, 92%, 55%)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', border: '2px solid hsl(38, 92%, 55%)' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', whiteSpace: 'pre-line' as const }
