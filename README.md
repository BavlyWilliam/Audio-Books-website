# 🇮🇹 Parla Italiano — Italiano A1 | Audio Companion

<p align="center">
  <strong>A lightweight digital audio companion for <em>Parla Italiano — Italiano A1</em></strong>
</p>

<p align="center">
  <a href="https://bavlywilliam.github.io/Audio-Books-website/">
    <img src="https://img.shields.io/badge/Live%20Website-Visit%20Project-2ea44f?style=for-the-badge" alt="Live Website">
  </a>
  <img src="https://img.shields.io/badge/HTML5-Frontend-orange?style=for-the-badge&logo=html5" alt="HTML5">
  <img src="https://img.shields.io/badge/JavaScript-Interactive-yellow?style=for-the-badge&logo=javascript" alt="JavaScript">
  <img src="https://img.shields.io/badge/Python-QR%20Automation-blue?style=for-the-badge&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Cloudflare%20R2-Audio%20Storage-f38020?style=for-the-badge&logo=cloudflare" alt="Cloudflare R2">
</p>

---

## 🌐 Live Website

### [Visit the Parla Italiano Audio Companion](https://bavlywilliam.github.io/Audio-Books-website/)

Students can scan a single QR code printed inside the physical book and immediately access the complete audio library from their phone.

---

## 📖 Project Overview

**Parla Italiano — Italiano A1** is a physical Italian language-learning book by **Prof. Marco Ashraf**.

This project provides a simple digital companion that allows students to access the accompanying audio without:

- Installing a mobile application
- Downloading large audio files
- Searching manually for individual tracks
- Creating an account
- Using a complicated interface

The goal is simple:

> **Scan → Open → Select a track → Listen**

---

## 🏗️ Architecture

The project uses a deliberately simple architecture:

```mermaid
flowchart TD
    A[📖 Physical Book] -->|Scan QR Code| B[🌐 GitHub Pages Website]
    B -->|Audio URLs| C[☁️ Cloudflare R2]
    C -->|Stream Audio| D[🎧 Student's Browser]
---

## 🎧 New audio pages (October 2026)

| Page | URL | QR code |
|---|---|---|
| **Parla Italiano A2 · Audio** — 12 units | <https://bavlywilliam.github.io/Audio-Books-website/a2/> | [`qr/a2-audio-qr.svg`](qr/a2-audio-qr.svg) · [PNG](qr/a2-audio-qr.png) · [labelled](qr/a2-audio-qr-labelled.png) |
| **Parla Italiano A1 · Audio** (2026 edition) — 10 units | <https://bavlywilliam.github.io/Audio-Books-website/a1/> | [`qr/a1-audio-qr.svg`](qr/a1-audio-qr.svg) · [PNG](qr/a1-audio-qr.png) · [labelled](qr/a1-audio-qr-labelled.png) |

- One track per unit: the unit's Italian vocabulary, grammar examples, dialogues and reading, with pauses to repeat.
- Voice: Prof. Marco Ashraf, recreated with the [Voice Clone Kit](https://github.com/BavlyWilliam/Voice-Clonning-project.) from his own recording, with his permission; every line checked with a speech recogniser.
- Audio is streamed from Cloudflare R2 (`audio/a2/uNN.mp3`, `audio/a1-2026/uNN.mp3`, MP3 64 kbps mono so it plays on iPhone and Android).
- Each unit has its own anchor (`/a2/#unit-07`) so a link or QR can open a specific unit.
- Static pages, no cookies, no tracking. Fonts: Gelasio and Noto Sans (SIL OFL, `assets/fonts/`).
- The original A1 page at the site root is unchanged, so the QR codes already printed in A1 books keep working.
