# Jetty (Island Hub)

Campus marketplace, verified off-campus student accommodation directory, and student services platform built for Nigeria Maritime University (NMU).

[![Live Site](https://img.shields.io/badge/Live%20Site-jetty.francisnaga.site-0F6E6E?logo=safari&logoColor=white)](https://jetty.francisnaga.site)
[![Next.js](https://img.shields.io/badge/Framework-Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

## Overview

**Jetty** is the dedicated campus marketplace and services platform built specifically for Nigeria Maritime University (NMU) students across both campuses: **Okerenkoko** and **Kurutie**.

Due to the university's delta riverine location, students navigate unique daily frictions: finding reliable off-campus accommodation across dispersed villages, procuring specialized cadet kits (uniforms, action rigs, safety boots), and booking local student service providers (barbers, laundry, tailoring, electronics repair).

Jetty provides a clean, mobile-first marketplace with verified student sellers, direct caretaker WhatsApp verification, and zero listing fees.

Visit the live platform at [jetty.francisnaga.site](https://jetty.francisnaga.site).

---

## Core Pillars

- **Campus Marketplace**: Peer-to-peer commerce for cadet uniforms, textbooks, electronics, and hostel necessities with instant WhatsApp seller links.
- **Off-Campus Lodge Directory**: Curated listing of student lodges in Okerenkoko and Kurutie with verified rents, amenities, photos, and direct caretaker contact.
- **Campus Services Directory**: Verified student entrepreneurs offering laundry, tailoring, grooming, phone repairs, and campus logistics.
- **Dual-Campus Filter**: One-tap toggle between Okerenkoko and Kurutie to view relevant local listings and services.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & Storage | Supabase (PostgreSQL + Storage buckets) |
| Icons | Lucide React |
| Live URL | [jetty.francisnaga.site](https://jetty.francisnaga.site) |

---

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/francisnaga/Island-Hub.git
   cd Island-Hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the local server**:
   ```bash
   npm run dev
   ```

---

## Author

Francis Naga ([Portfolio](https://francisnaga.site) / [GitHub](https://github.com/francisnaga))

---

## License

Proprietary. All rights reserved.
