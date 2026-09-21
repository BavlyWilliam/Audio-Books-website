# 🇮🇹 Parla Italiano — Italiano A1 | Audio Companion

<p align="center">
  <strong>A lightweight digital audio companion for the book <em>Parla Italiano — Italiano A1</em></strong>
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