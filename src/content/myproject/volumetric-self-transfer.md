---
title: "Volumetric Self-Transfer Relighting"
description: "Real-time relighting for participating media using precomputed spherical-harmonic transport and an OpenGL volume renderer."
tags: [Graphics, OpenGL]
order: 2
github: "https://github.com/heziq/Volumetric_Self-Transfer_CSE274"
role: "Independent course project"
stack: [C++17, OpenGL, GLSL, Python, PyTorch, CMake]
---

## Overview

A cloud changes appearance as light travels through it: denser areas cast soft shadows into the volume. Recomputing that transport whenever the sky changes is expensive. This renderer separates the volume's self-shadowing from the environment light, so the sky can rotate or switch while the cloud responds at interactive frame rates.

## Precompute the transport

The offline Python pipeline samples Beer–Lambert transmittance through a 64 × 64 × 64 voxel grid from 512 directions per voxel. It projects that self-transfer into spherical-harmonic (SH) coefficients, with 9, 25, or 49 coefficients available to trade storage and precompute time for directional detail.

The density field uses 3D fBm noise to create a cloud-like structure. The precompute and renderer use the same density definition, because changing the volume would invalidate the saved transport.

## Relight at runtime

An HDR environment map is projected into SH lighting coefficients. The C++/OpenGL runtime loads the precomputed transfer into 3D textures; at each GLSL ray-march sample, it combines the lighting and transfer coefficients to reconstruct incoming radiance. The renderer also includes volume integration, ACES tone mapping, and directional scattering.

ImGui controls make the result explorable: switch HDR environments and SH orders, rotate the sky, adjust noise and exposure, and inspect debug views. Rotating the environment updates the cloud's lighting without repeating the expensive transport precompute.

## What the comparison shows

Self-transfer adds darker cloud interiors and directional shading that plain environment lighting misses. Higher SH orders preserve more directional detail, while increasing transfer-data size. The project makes that visual and performance trade-off inspectable in a single interactive renderer.
