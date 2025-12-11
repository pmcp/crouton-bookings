<script setup lang="ts">
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@vue-email/components'
import { env } from '@@/env'

interface BookingNotificationProps {
  subject: string
  bodyHtml: string // Already rendered with variables
  teamName: string
  teamLogo?: string
  previewText?: string
}

withDefaults(defineProps<BookingNotificationProps>(), {
  subject: 'Booking Notification',
  bodyHtml: '',
  teamName: '',
  teamLogo: '',
  previewText: '',
})

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  padding: '40px 24px',
  margin: '0 auto',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  marginTop: '32px',
  marginBottom: '32px',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '24px',
  color: '#333',
  textAlign: 'center' as const,
}

const bodyContent = {
  fontSize: '16px',
  color: '#444',
  lineHeight: '26px',
}

const footer = {
  fontSize: '14px',
  color: '#898989',
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #eee',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#898989',
  textDecoration: 'underline',
}
</script>

<template>
  <Html>
    <Head />
    <Preview>{{ previewText || subject }}</Preview>
    <Body :style="main">
      <Container :style="container">
        <!-- Logo Section -->
        <Section :style="logoSection">
          <Img
            v-if="teamLogo"
            :src="teamLogo"
            width="60"
            :alt="teamName"
            style="margin: 0 auto;"
          />
          <Img
            v-else
            :src="env.LOGO_URL"
            width="40"
            :alt="env.APP_NAME"
            style="margin: 0 auto;"
          />
        </Section>

        <!-- Subject as Heading -->
        <Heading :style="heading">
          {{ subject }}
        </Heading>

        <!-- Body Content (pre-rendered HTML) -->
        <Section :style="bodyContent">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="bodyHtml" />
        </Section>

        <!-- Footer -->
        <Text :style="footer">
          This email was sent by {{ teamName || env.APP_NAME }}.
          <br>
          <Link
            :href="env.BASE_URL"
            target="_blank"
            :style="footerLink"
          >
            {{ env.APP_NAME }}
          </Link>
          - {{ env.APP_DESCRIPTION }}
        </Text>
      </Container>
    </Body>
  </Html>
</template>
