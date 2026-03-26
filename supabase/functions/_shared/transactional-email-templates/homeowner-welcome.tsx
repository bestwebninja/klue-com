import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Kluje'
const SITE_URL = 'https://kluje.lovable.app'

interface HomeownerWelcomeProps {
  name?: string
}

const HomeownerWelcomeEmail = ({ name }: HomeownerWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME}! Find the perfect tradesperson</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>🏠 Welcome to {SITE_NAME}!</Heading>
          <Text style={subtitle}>Your trusted platform for finding quality service providers</Text>
        </Section>

        <Text style={text}>
          Hi {name || 'there'},
        </Text>
        <Text style={text}>
          Welcome to {SITE_NAME}! Whether you need a plumber, electrician, builder, or any other tradesperson, we're here to connect you with verified professionals in your area.
        </Text>

        <Hr style={hr} />

        <Heading as="h2" style={h2}>📋 How It Works</Heading>
        <Text style={text}>
          <strong>1. Post your job</strong> — Describe what you need done, add photos if helpful, and set your budget range.
        </Text>
        <Text style={text}>
          <strong>2. Receive quotes</strong> — Qualified service providers will send you quote requests. You'll be notified by email.
        </Text>
        <Text style={text}>
          <strong>3. Compare and choose</strong> — Review profiles, ratings, and reviews to find the perfect match.
        </Text>
        <Text style={text}>
          <strong>4. Hire and review</strong> — Accept a quote, complete your project, and leave a review to help others.
        </Text>

        <Hr style={hr} />

        <Heading as="h2" style={h2}>💡 Tips for Getting the Best Quotes</Heading>
        <Text style={text}>
          • <strong>Be specific</strong> — The more detail you provide, the more accurate quotes you'll receive.
        </Text>
        <Text style={text}>
          • <strong>Add photos</strong> — Pictures help providers understand the scope and give better estimates.
        </Text>
        <Text style={text}>
          • <strong>Look for verified badges</strong> — Verified providers have been checked by our team.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={`${SITE_URL}/post-job`}>
            Post Your First Job
          </Button>
        </Section>
        <Section style={buttonContainer}>
          <Button style={outlineButton} href={`${SITE_URL}/providers`}>
            Browse Service Providers
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
  component: HomeownerWelcomeEmail,
  subject: `Welcome to ${SITE_NAME}! 🏠 Let's find you the perfect tradesperson`,
  displayName: 'Homeowner welcome',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Open Sans', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '580px', margin: '0 auto' }
const headerSection = { backgroundColor: 'hsl(220, 13%, 18%)', padding: '24px', borderRadius: '8px 8px 0 0', textAlign: 'center' as const, marginBottom: '24px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px' }
const subtitle = { fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: '0' }
const h2 = { fontSize: '18px', fontWeight: 'bold', color: 'hsl(220, 13%, 18%)', margin: '24px 0 12px' }
const text = { fontSize: '14px', color: 'hsl(220, 9%, 46%)', lineHeight: '1.6', margin: '0 0 12px' }
const hr = { borderColor: 'hsl(220, 13%, 91%)', margin: '24px 0' }
const buttonContainer = { textAlign: 'center' as const, margin: '8px 0' }
const button = { backgroundColor: 'hsl(38, 92%, 55%)', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }
const outlineButton = { backgroundColor: 'transparent', color: 'hsl(38, 92%, 55%)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', border: '2px solid hsl(38, 92%, 55%)' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', whiteSpace: 'pre-line' as const }
