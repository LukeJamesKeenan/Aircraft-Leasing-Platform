# Aircraft Leasing Portfolio & Pricing Platform

A full-stack aircraft leasing analyst tool built in React/Typescript and Excel, designed to mirror the workflows of a lessor's pricing and portoflio risk team.

## Overview

This platform consists of three integrated commands:

## 1. Portfolio Monitoring Dashboard (React/Typescript)
- Tracks lease events, maintenance milestones and cash positions across 30/60/180  horizons
- Fleet-wide KPI summary including high-risk aircraft flags, active leases and maintenance alerts
- Interactive timeline visualisation per aircraft with clickable event editing
- CSV export functionality feeding directly into the Excel stress model
- Built with React, Typescript and Vite

## 2. Aircraft Lease Pricing Engine (Excel & React/Typescript)
- Lease Rate Factor (LRF) calculator using PMT-based logic
- Age-adjusted residual value curves across A320ceo, A321ceo, B737-800 and A320neo
- Sensitivity matrix showing LRF across funding cost and tenor combinations
- Fleet pricing summary with side-by-side LRF and implied return comparison
- IRR output using Newton-Raphson XIRR approximation
- Live pricing calculator integrated into the web dashboard

## 3. Portfolio Lease Downside Stress Engine (Excel)
- Multi-scenario stress model across a 10-lease portfolio
- Models redelivery cost exposure across engine shop visits, LLP top-ups and airframe redelivery
- Probability-weighted expected value (70/20/10 base/downside/severe scenarios)
- Portfolio benchmarking against current maket LRF with variance analysis
- Repricing risk flagging across 30/90/180 day and 1/2 year horizons

## How the System Works

Pricing model => stress assumptions feed into => Downside Engine => portfolio events feed into => Web Dashboard => CSV export back to => Downside Engine

## Tech Stack
- React 18. TypeScript, Vite
- Microsoft Excel (Advanced modelling)
- Power BI (Dashboard visualisation)

## Aircraft Types Covered
A320ceo | A321ceo | B737-800 | A320neo | A321ne0 | B737-900ER

## Getting Started
```bash
npm install
npm run dev
```

## Author
Luke Keenan | Accounting & Finance Graduate | Certificate in Aviation Leasing & Finance (Law Society of Ireland)



