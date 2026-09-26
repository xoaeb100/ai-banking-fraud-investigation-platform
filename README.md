# AI-Powered Banking Fraud Investigation Platform

An AI-enabled banking fraud detection and investigation platform built with **NestJS, PostgreSQL, Redis, FastAPI, Random Forest, RAG, and an LLM-powered investigation agent**.

The platform combines deterministic fraud rules with machine-learning-based risk detection. Suspicious transactions are then investigated using an AI agent that retrieves transaction data, customer history, previous cases, fraud rules, and internal fraud policies before producing a structured investigation report for a human fraud analyst.

> **AI assists the investigation process; it does not make the final fraud decision.**

---

## Overview

The platform is designed around a hybrid fraud-detection architecture:

```text
Transaction
    ↓
NestJS Backend
    ↓
PostgreSQL
    ↓
Redis / Async Processing
    ↓
Fraud Feature Engineering
    ↓
Rules + ML
    ↓
Risk Engine
    ↓
LOW / MEDIUM / HIGH
    ↓
Alert / Investigation Case
    ↓
AI Investigation Agent
    ↓
Tool Calling + RAG
    ↓
Structured Investigation Report
    ↓
Human Fraud Analyst
```

The system separates **fraud detection** from **fraud investigation**.

The fraud engine determines the system's risk level using deterministic rules and ML predictions. The AI investigation layer uses that evidence to help an analyst understand why a transaction requires attention and what policies or previous cases are relevant.

---

## Architecture

```text
                         ┌─────────────────┐
                         │   Angular UI    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ NestJS Backend  │
                         └───────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐      ┌────────────┐    ┌──────────────┐
       │ PostgreSQL │      │   Redis    │    │ FastAPI ML   │
       │ + pgvector │      │            │    │   Service    │
       └────────────┘      └──────┬─────┘    └──────┬───────┘
                                  │                 │
                                  │                 ▼
                                  │          ┌──────────────┐
                                  │          │Random Forest │
                                  │          │    Model     │
                                  │          └──────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Fraud Processing│
                         │     Worker      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Risk Engine   │
                         │                 │
                         │ Rules + ML      │
                         └────────┬────────┘
                                  │
                           ┌──────┴──────┐
                           │             │
                           ▼             ▼
                         Alert      Investigation
                                      Case
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ Investigation    │
                              │      Agent       │
                              └────────┬─────────┘
                                       │
                         ┌─────────────┼─────────────┐
                         ▼             ▼             ▼
                    Database        RAG          Previous
                      Tools       Policies        Cases
                         │             │             │
                         └─────────────┼─────────────┘
                                       ▼
                                      LLM
                                       │
                                       ▼
                              Structured Report
                                       │
                                       ▼
                              Human Fraud Analyst
```

---

## Core Transaction Flow

Transactions are persisted before fraud processing begins.

The fraud-processing pipeline runs asynchronously so that temporary ML-service failures do not prevent the transaction from being persisted.

```text
Client
  ↓
POST /transactions
  ↓
NestJS
  ↓
Persist transaction
  ↓
Queue fraud-processing job
  ↓
Return transaction response
  ↓
Redis
  ↓
Fraud Worker
  ↓
Feature Engineering
  ↓
FastAPI ML Service
  ↓
Random Forest
  ↓
Rules + ML
  ↓
Risk Engine
  ↓
Update transaction
  ↓
Create Alert / Investigation Case
```

This introduces eventual consistency between transaction creation and fraud assessment while keeping the transaction path independent of ML-service availability.

---

## Design Principles

### 1. ML is not the final fraud decision

The Random Forest model produces a fraud probability.

Deterministic business rules provide additional signals.

The Risk Engine combines these signals into the platform's final risk level.

```text
ML Probability
      +
Deterministic Rules
      ↓
   Risk Engine
      ↓
 LOW / MEDIUM / HIGH
```

The LLM is not permitted to modify this system risk level.

### 2. AI assists human investigators

The investigation agent retrieves evidence and relevant policy information, reasons over the available evidence, and produces a structured report.

The final investigation decision remains with the human fraud analyst.

### 3. Fraud processing is asynchronous

The transaction system does not depend on synchronous ML availability.

If the ML service is unavailable, the transaction can still be persisted and fraud processing can be retried later.

### 4. Internal policy knowledge is grounded through RAG

Fraud-policy questions are answered using retrieved internal policy content rather than relying solely on the LLM's general knowledge.

### 5. Services are isolated

The backend, ML service, PostgreSQL, and Redis run as separate Docker services and communicate through the Docker Compose network.
