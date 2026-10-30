# -*- coding: utf-8 -*-
"""
This code is to model a pulse tube refrigerator (ptr) consisting of a 
regenerator ambient heat exchanger (regahx), a regenerator (reg), a regenerator 
cold heat exchanger (regchx), a pulse tube (pt), and a pulse tube ambient heat 
exchanger (ptahx). 

Assumptions:
- For the three heat exchangers, i.e., regahx, regchx, and ptchx, the 
  temperatures of both working fluid and solid surface are assumed to be constant 
  and the temperature difference between the working fluid and the solid surface 
  drives the heat transfer.
- The total energy flow rate equals to the acoustic power at the inlet of the ptr.
- The phase angle of pressure oscillation at the inlet of the ptr is zero deg.
- The model for circular tube is used for simulating the regenerator and pulse tube.
- Helium is the working fluid.
- The regenerator and its packing materials, as well as the pulse tube, are 
made of stainless steel, while the three heat exchangers are made of copper.

Inputs:
pm: mean pressure, [Pa]
pratioptr: pressure ratio of the pressure oscillation at the inlet of ptr, [-]
AngleUptr: phase angle of the volumetric flow rate oscillation at the inlet of ptr, [m^3/s]
Powerptr: acoustic power at the inlet of ptr, [W]
f: frequency of the oscillation, [Hz]
Tregahxsolid: solid surface temperature of the regahx, [K]
Tregchxsolid: solid surface temperature of the regchx, [K]
Tptahxsolid: solid surface temperature of the regchx, [K]
Geometries of all components

Outputs:
Q_doc_c: refrigeration capacity, [W] 
COP: COP, [-]

Plots:
Anglep, AngleU, and ADpU vs position along the ptr
Absp and AbsU vs position along the ptr
Tm and Tsolid vs position along the ptr
Power and H vs position along the ptr

Programmed by Ke Tang
Update date: 9-29-26
"""

import numpy as np
from scipy.special import jv
import matplotlib.pyplot as plt


# ---------------------------------------------------------
# 1. Inputs of operating conditions
# ---------------------------------------------------------

Powerptr = 150 # accoutic power at the inlet of ptr, [W]
pm = 3000000.0 # mean pressure, [Pa]
pratioptr = 1.2 # pressure ratio (p_max/p_min) at the inlet of ptr, [-]
pptr = pm*(pratioptr-1)/(pratioptr+1) # pressure amplitude p_1 at the inlet of ptr, [Pa], assuming zero for its phase angle
Anglepptr = np.angle(pptr)/np.pi*180 # phase angle of pptr, [deg]
# UptrA = 7.5E-4 # magnitude of volumetric flow rate amplitude at the inlet of ptr, [m^3/s]
AngleUptr = 15 # phase angle of Uptr, [deg], it is also the phase difference between U_1 and p_1
# Uptr = UptrA * (np.cos(AngleUptr/180*np.pi) + 1j * np.sin(AngleUptr/180*np.pi)) # velocity amplitude at the inlet of ptr, [m/s]
Uptr = 2*Powerptr/(abs(pptr)*np.cos(np.angle(pptr)-AngleUptr/180*np.pi))*(np.cos(AngleUptr/180*np.pi) + 1j * np.sin(AngleUptr/180*np.pi))
# AngleUptr = np.angle(Uptr)/np.pi*180 # phase angle of Uptr, [deg]
UptrA = np.abs(Uptr) # magnituge of Uptr, [m^3/s]
# Powerptr = 0.5*np.real(pptr*np.conj(Uptr)) 
Tregahxsolid = 300 # temperature, [K]
Tregchxsolid = 100 # temperature, [K]
Tptahxsolid = 300 # temperature, [K]
f = 40.0 # frequecy of oscillation, [Hz]
omega = 2.0 * np.pi * f # angular frequency, [rad/s]


# ---------------------------------------------------------
# 2. Geometry and thermal properties
# ---------------------------------------------------------

# Regenerator AHX
Aregahx = np.pi * (0.011**2) # section area, [m^2]
lregahx = 0.01 # length, [m]
rhregahx = 0.0005 # hydraulic radius, [m]
phiregahx = 0.692 # porosity, [-]
FactorForHTCregahx = 1 # to adjust HTC

Areg = Aregahx
lreg = 0.06
rhreg = 0.0000224
rwirereg = 0.00004
phireg = 0.692
deltawallreg = 0.0005

Aregchx = Aregahx
lregchx = 0.01
rhregchx = 0.0005
phiregchx = 0.692
FactorForHTCregchx = 1 # to adjust HTC

rpt = 0.005
Apt = np.pi * rpt**2
lpt = 0.12
rhpt = rpt / 2.0
rwirept = 0.0005
phipt = 1
deltawallpt = 0.0005

Aptahx = Apt
lptahx = 0.01
rhptahx = 0.0005
phiptahx = 0.692
FactorForHTCptahx = 1 # to adjust HTC


# Thermal properties of helium at 3000 kPa and 300 K. The variation with T is 
# included in the code but no code is inculded for the variation with pm.

# The following properties are for 300 K and 3 MPa.
a = 1032.5 # sound speed, [m/s]
rhom = 4.747 # density, [kg/m^3]
cp = 5194.2 # constant-pressure spcific heat, [J/(kg-K)] 
shr = 1.664 # specific heat ratio, [-]
k = 0.1574 # conductivity, [W/(m-K)]
Pr = 0.6597 # Prandtl number, [-]
mu = 19.99e-6 # viscosity, [Pa-s]
rhomregahxsolid = 8957.0 # density of copper for reg. AHX material, [kg/m^3]
rhomregsolid = 7860.0 # density of stainless steel for regenerative material, [kg/m^3] 
rhomregchxsolid = 8957.0 # density of copper for reg. CHX material, [kg/m^3]
rhomptsolid = 7860.0 # density of stainless steel for pulse tube wall, [kg/m^3]
rhomptahxsolid = 8957.0 # density of copper for pt AHX material, [kg/m^3]


# ---------------------------------------------------------
# 3. Numbers of segments for each component
# ---------------------------------------------------------

Nptrhx = 10 # number of seg
Nreg = 100
Npt = 100


# ---------------------------------------------------------
# 4. Main simulation code
# ---------------------------------------------------------

# Controls for iteration, used to reduce the sensitivity of the Tptr1 guess
Treg_lowcontrol = Tregchxsolid-5 # [K]
Tpt_upcontrol = Tptahxsolid+50 # [K]
Treg_lowcontrol_flag = True
Treg_upcontrol_flag = True
Tpt_lowcontrol_flag = True
Tpt_upcontrol_flag = True

# Initial guess
Tptr1 = 317 # fluid temperature at the AHX inlet, [K]  

while Treg_lowcontrol_flag or Treg_upcontrol_flag or Tpt_lowcontrol_flag or Tpt_upcontrol_flag:
        
    # Initial guess
    if Treg_lowcontrol_flag:
        Tptr1 = Tptr1+0.01 
    elif Treg_upcontrol_flag:
        Tptr1 = Tptr1-0.009
    elif Tpt_lowcontrol_flag:
        Tptr1 = Tptr1+0.01
    elif Tpt_upcontrol_flag:
        Tptr1 = Tptr1-0.009

    Treg_lowcontrol_flag = False
    Treg_upcontrol_flag = False
    Tpt_lowcontrol_flag = False
    Tpt_upcontrol_flag = False       
    
    errorHptr6 = 0.011
    RelaxFactor_Hptr6 = 0.00002
    while abs(errorHptr6)>0.01:
        
        Tptr1 = Tptr1 + errorHptr6*RelaxFactor_Hptr6
        print('Tptr1 =',Tptr1,'[K]')
    
        
        ######################################################################################
        ######################################################################################
        
        # Conditions at the inlet of ptr
        pptr1 = pptr # pressure amplitude at the AHX inlet, [Pa]
        Uptr1 = Uptr # volume metric flow rate amplitude at the AHX inlet, [m^3/s]
        Anglepptr1 = Anglepptr # [deg]
        AngleUptr1 = AngleUptr # [deg]
        ADpUptr1 = Anglepptr1-AngleUptr1 # [deg]
        Powerptr1 = Powerptr # accoustic at the AHX inlet, [W]
        Hptr1 = Powerptr1 # total energy flow at the AHX inlet, [W]
        
        # (1) Regenerator AHX
        Tregahx = Tptr1 # [K]
        aregahx = a * np.sqrt(Tregahx / 300.0) # [m/s]
        rhomregahx = rhom * 300.0 / Tregahx # [kg/m^3]
        kregahx = k * (Tregahx / 300.0)**0.7 # [W/(m-K)]
        muregahx = mu * (Tregahx / 300.0)**0.7 # [Pa-s]
        
        deltakapparegahx = np.sqrt(2.0 * kregahx / (omega * rhomregahx * cp))
        deltanuregahx = np.sqrt(2.0 * muregahx / (omega * rhomregahx))
    
        arg_k_regahx = (1j - 1.0) * 2.0 * rhregahx / deltakapparegahx
        arg_nu_regahx = (1j - 1.0) * 2.0 * rhregahx / deltanuregahx
    
        fkapparegahx = 2.0 * jv(1, arg_k_regahx) / (jv(0, arg_k_regahx) * arg_k_regahx)
        fnuregahx = 2.0 * jv(1, arg_nu_regahx) / (jv(0, arg_nu_regahx) * arg_nu_regahx)
    
        Lregahx = lregahx * rhomregahx / (Aregahx * phiregahx) * (1.0 - np.real(fnuregahx)) / (abs(1.0 - fnuregahx)**2)
        Rnuregahx = (omega * rhomregahx / Aregahx) * (np.imag(-fnuregahx) / (abs(1.0 - fnuregahx)**2)) * lregahx
        Cregahx = (Aregahx * lregahx * phiregahx) / (aregahx**2 * rhomregahx) * (1.0 + (shr - 1.0) * np.real(fkapparegahx))
        Rkapparegahx = (shr / (shr - 1.0)) * (pm / (omega * Aregahx * phiregahx * np.imag(-fkapparegahx))) / lregahx
    
        deltaLregahx = Lregahx / Nptrhx
        deltaRnuregahx = Rnuregahx / Nptrhx
        deltaCregahx = Cregahx / Nptrhx
        deltaRkapparegahx = Rkapparegahx * Nptrhx
        
        HTCregahx = kregahx/min(deltakapparegahx,rhregahx)*FactorForHTCregahx # convection heat transfer coefficient, [W/(m^2-K)]
        Qregahx = HTCregahx*Aregahx*lregahx/rhregahx*(Tregahxsolid - Tregahx) # heat tranfer rate of reg. AHX, [W]
    
        Uregahx = np.zeros(Nptrhx + 1, dtype=complex)
        pregahx = np.zeros(Nptrhx + 1, dtype=complex)
        Hregahx = np.zeros(Nptrhx + 1)
    
        Uregahx[0] = Uptr1 # volumetric flow rate amplitude at the inlet of the first segment, [m^3/s]
        pregahx[0] = pptr1 - Uregahx[0] * (1j * omega * deltaLregahx + deltaRnuregahx) # pressure amplitude at the outlet of the first segment, [Pa]
        Hregahx[0] = Hptr1 # total energy flow rate at the inlet of the first segment, [W]
    
        for iregahx in range(1, Nptrhx):
            Uregahx[iregahx] = Uregahx[iregahx - 1] - pregahx[iregahx - 1] * (1j * omega * deltaCregahx + 1.0 / deltaRkapparegahx)
            pregahx[iregahx] = pregahx[iregahx - 1] - Uregahx[iregahx] * (1j * omega * deltaLregahx + deltaRnuregahx)
            Hregahx[iregahx] = Hregahx[iregahx - 1] + Qregahx/Nptrhx
    
        pptr2 = pregahx[Nptrhx - 1]
        Uptr2 = Uregahx[Nptrhx - 1] - pregahx[Nptrhx - 1] * (1j * omega * deltaCregahx + 1.0 / deltaRkapparegahx)
        Anglepptr2 = np.angle(pptr2)/np.pi*180 # [deg]
        AngleUptr2 = np.angle(Uptr2)/np.pi*180 # [deg]
        ADpUptr2 = Anglepptr2-AngleUptr2 # [deg]
        Powerptr2 = 0.5*np.real(pptr2*np.conj(Uptr2))
        Hptr2 = Hregahx[Nptrhx - 1] + Qregahx/Nptrhx # total energy flow rate, [W]
        Tptr2 = Tptr1 # temperature, [K]
    
        
        ######################################################################################
        ######################################################################################
        
        # (2) Regenerator
        Treg = np.zeros(Nreg + 1)
        areg = np.zeros(Nreg + 1)
        rhomreg = np.zeros(Nreg + 1)
        kreg = np.zeros(Nreg + 1)
        kregsolid = np.zeros(Nreg + 1)
        cregsolid = np.zeros(Nreg + 1)
        mureg = np.zeros(Nreg + 1)
        deltakappareg = np.zeros(Nreg + 1)
        deltanureg = np.zeros(Nreg + 1)
        deltakapparegsolid = np.zeros(Nreg + 1)
        
        fkappareg = np.zeros(Nreg + 1, dtype=complex)
        fnureg = np.zeros(Nreg + 1, dtype=complex)
        xireg = np.zeros(Nreg + 1, dtype=complex)
        dTmdxreg = np.zeros(Nreg + 1)
        
        Lreg = np.zeros(Nreg + 1)
        Rnureg = np.zeros(Nreg + 1)
        Creg = np.zeros(Nreg + 1)
        Ereg = np.zeros(Nreg + 1, dtype=complex)
        Rkappareg = np.zeros(Nreg + 1)
        
        Ureg = np.zeros(Nreg + 1, dtype=complex)
        preg = np.zeros(Nreg + 1, dtype=complex)
        AngleUreg = np.zeros(Nreg + 1)
        Anglepreg = np.zeros(Nreg + 1)
        ADpUreg = np.zeros(Nreg + 1)
        
        # The first segment of the regenerator
        Treg[0] = Tptr2 # [K]
        areg[0] = a * np.sqrt(Treg[0] / 300.0) # [m/s]
        rhomreg[0] = rhom * 300.0 / Treg[0] # [kg/m^3]
        kreg[0] = k * (Treg[0] / 300.0)**0.7 # [W/(m-K)]
        kregsolid[0] = 3.4372 * np.log(Treg[0]) - 6.2082 # [W/(m-K)]
        cregsolid[0] = -0.0043 * Treg[0]**2 + 3.0505 * Treg[0] - 41.617 # [J/(kg-K)]
        mureg[0] = mu * (Treg[0] / 300.0)**0.7 # [Pa-s]
        
        deltakappareg[0] = np.sqrt(2.0 * kreg[0] / (omega * rhomreg[0] * cp))
        deltanureg[0] = np.sqrt(2.0 * mureg[0] / (omega * rhomreg[0]))
        deltakapparegsolid[0] = np.sqrt(2.0 * kregsolid[0] / (omega * rhomregsolid * cregsolid[0]))
        
        arg_k0 = (1j - 1.0) * 2.0 * rhreg / deltakappareg[0]
        arg_nu0 = (1j - 1.0) * 2.0 * rhreg / deltanureg[0]
        
        fkappareg[0] = 2.0 * jv(1, arg_k0) / (jv(0, arg_k0) * arg_k0)
        fnureg[0] = 2.0 * jv(1, arg_nu0) / (jv(0, arg_nu0) * arg_nu0)
        
        xireg[0] = np.sqrt((kreg[0] * rhomreg[0] * cp) / (kregsolid[0] * rhomregsolid * cregsolid[0])) * \
                   ((fkappareg[0] * (1.0 + 1j) * rhreg / deltakappareg[0]) / (np.tanh((1.0 + 1j) * rwirereg / deltakapparegsolid[0])))
        
        Hreg = Hptr2 # total energy flow rate, [W]
        
        dTmdxreg[0] = (Hreg - 0.5 * np.real(pptr2 * np.conj(Uptr2) * (1.0 - (fkappareg[0] - np.conj(fnureg[0])) / ((1.0 + xireg[0]) * (1.0 + Pr) * (1.0 - np.conj(fnureg[0])))))) / \
                      ((rhomreg[0] * cp * (abs(Uptr2)**2) * np.imag(np.conj(fnureg[0]) + (fkappareg[0] - np.conj(fnureg[0])) * (1.0 + xireg[0] * fnureg[0] / fkappareg[0]) / ((1.0 + xireg[0]) * (1.0 + Pr)))) / \
                      (2.0 * Areg * phireg * omega * (1.0 - Pr) * (abs(1.0 - fnureg[0])**2)) - (Areg * phireg * kreg[0] + Areg * (1.0 - phireg) * kregsolid[0] * 0.1))
        
        Lreg[0] = (lreg / Nreg) * rhomreg[0] / (Areg * phireg) * (1.0 - np.real(fnureg[0])) / (abs(1.0 - fnureg[0])**2)
        Rnureg[0] = (omega * rhomreg[0] / (Areg * phireg)) * (np.imag(-fnureg[0]) / (abs(1.0 - fnureg[0])**2)) * (lreg / Nreg)
        Creg[0] = (Areg * (lreg / Nreg) * phireg) / (areg[0]**2 * rhomreg[0]) * (1.0 + (shr - 1.0) * np.real(fkappareg[0] / (1.0 + xireg[0])))
        Ereg[0] = ((fkappareg[0] - fnureg[0]) / ((1.0 - fnureg[0]) * (1.0 - Pr) * (1.0 + xireg[0]))) * (2.0 / (2.0 * Treg[0] + dTmdxreg[0] * (lreg / Nreg))) * dTmdxreg[0] * (lreg / Nreg)
        Rkappareg[0] = (shr / (shr - 1.0)) * (pm / (omega * Areg * phireg * np.imag(-fkappareg[0] / (1.0 + xireg[0])))) / (lreg / Nreg)
        
        Ureg[0] = Uptr2
        preg[0] = pptr2 - Ureg[0] * (1j * omega * Lreg[0] + Rnureg[0])
        AngleUreg[0] = np.angle(Ureg[0])/np.pi*180 # phase angle of U at the inlet of the segment, [deg]
        Anglepreg[0] = np.angle(preg[0])/np.pi*180 # phase angle of p at the outlet of the segment, [deg]
        ADpUreg[0] = Anglepreg[0]-AngleUreg[0] # phase difference, angle(p)-angle(U), at the inlet of the segment, [deg]
        
        
        # The othe segment of regenerator
        for ireg in range(1, Nreg):
            
            Ureg[ireg] = Ureg[ireg - 1] - preg[ireg - 1] * (1j * omega * Creg[ireg - 1] + 1.0 / Rkappareg[ireg - 1]) + Ereg[ireg - 1] * Ureg[ireg - 1]
            Treg[ireg] = Treg[ireg - 1] + dTmdxreg[ireg - 1] * (lreg / Nreg)
            
            if Treg[ireg] > Treg[0]:
                # Treg_upcontrol_flag = True
                # print('ireg =',ireg)
                # print('Treg[ireg] =',Treg[ireg],'[K]')
                # print('Abnormal high temperature shows up in the regenerator. The guess of Tptr1 needs an update, e.g., -0.009 K.')
                break
            elif Treg[ireg] < Treg_lowcontrol:
                # Treg_lowcontrol_flag = True
                # print('ireg =',ireg)
                # print('Treg[ireg] =',Treg[ireg],'[K]')
                # print('Abnormal low temperature shows up in the regenerator. The guess of Tptr1 needs an update, e.g., +0.01 K.')
                break                      
            
            areg[ireg] = a * np.sqrt(Treg[ireg] / 300.0)
            rhomreg[ireg] = rhom * 300.0 / Treg[ireg]
            kreg[ireg] = k * (Treg[ireg] / 300.0)**0.7
            kregsolid[ireg] = 3.4372 * np.log(Treg[ireg]) - 6.2082
            cregsolid[ireg] = -0.0043 * Treg[ireg]**2 + 3.0505 * Treg[ireg] - 41.617
            mureg[ireg] = mu * (Treg[ireg] / 300.0)**0.7
            
            deltakappareg[ireg] = np.sqrt(2.0 * kreg[ireg] / (omega * rhomreg[ireg] * cp))
            deltanureg[ireg] = np.sqrt(2.0 * mureg[ireg] / (omega * rhomreg[ireg]))
            deltakapparegsolid[ireg] = np.sqrt(2.0 * kregsolid[ireg] / (omega * rhomregsolid * cregsolid[ireg]))
            
            arg_ki = (1j - 1.0) * 2.0 * rhreg / deltakappareg[ireg]
            arg_nui = (1j - 1.0) * 2.0 * rhreg / deltanureg[ireg]
            
            fkappareg[ireg] = 2.0 * jv(1, arg_ki) / (jv(0, arg_ki) * arg_ki)
            fnureg[ireg] = 2.0 * jv(1, arg_nui) / (jv(0, arg_nui) * arg_nui)
            
            xireg[ireg] = np.sqrt((kreg[ireg] * rhomreg[ireg] * cp) / (kregsolid[ireg] * rhomregsolid * cregsolid[ireg])) * \
                          ((fkappareg[ireg] * (1.0 + 1j) * rhreg / deltakappareg[ireg]) / (np.tanh((1.0 + 1j) * rwirereg / deltakapparegsolid[ireg])))
            
            dTmdxreg[ireg] = (Hreg - 0.5 * np.real(preg[ireg - 1] * np.conj(Ureg[ireg]) * (1.0 - (fkappareg[ireg] - np.conj(fnureg[ireg])) / ((1.0 + xireg[ireg]) * (1.0 + Pr) * (1.0 - np.conj(fnureg[ireg])))))) / \
                             ((rhomreg[ireg] * cp * (abs(Ureg[ireg])**2) * np.imag(np.conj(fnureg[ireg]) + (fkappareg[ireg] - np.conj(fnureg[ireg])) * (1.0 + xireg[ireg] * fnureg[ireg] / fkappareg[ireg]) / ((1.0 + xireg[ireg]) * (1.0 + Pr)))) / \
                             (2.0 * Areg * phireg * omega * (1.0 - Pr) * (abs(1.0 - fnureg[ireg])**2)) - (Areg * phireg * kreg[ireg] + Areg * (1.0 - phireg) * kregsolid[ireg] * 0.1))
                             
            Lreg[ireg] = (lreg / Nreg) * rhomreg[ireg] / (Areg * phireg) * (1.0 - np.real(fnureg[ireg])) / (abs(1.0 - fnureg[ireg])**2)
            Rnureg[ireg] = (omega * rhomreg[ireg] / (Areg * phireg)) * (np.imag(-fnureg[ireg]) / (abs(1.0 - fnureg[ireg])**2)) * (lreg / Nreg)
            Creg[ireg] = (Areg * (lreg / Nreg) * phireg) / (areg[ireg]**2 * rhomreg[ireg]) * (1.0 + (shr - 1.0) * np.real(fkappareg[ireg] / (1.0 + xireg[ireg])))
            Ereg[ireg] = ((fkappareg[ireg] - fnureg[ireg]) / ((1.0 - fnureg[ireg]) * (1.0 - Pr) * (1.0 + xireg[ireg]))) * (2.0 / (2.0 * Treg[ireg] + dTmdxreg[ireg] * (lreg / Nreg))) * dTmdxreg[ireg] * (lreg / Nreg)
            Rkappareg[ireg] = (shr / (shr - 1.0)) * (pm / (omega * Areg * phireg * np.imag(-fkappareg[ireg] / (1.0 + xireg[ireg])))) / (lreg / Nreg)
            
            preg[ireg] = preg[ireg - 1] - Ureg[ireg] * (1j * omega * Lreg[ireg] + Rnureg[ireg])
            
            AngleUreg[ireg] = np.angle(Ureg[ireg])/np.pi*180 # phase angle of U at the inlet of the segment, [deg]
            Anglepreg[ireg] = np.angle(preg[ireg])/np.pi*180 # phase angle of p at the outlet of the segment, [deg]
            ADpUreg[ireg] = Anglepreg[ireg-1]-AngleUreg[ireg] # phase difference, angle(p)-angle(U), at the inlet of the segment, [deg]
        
        if Treg[ireg] > Treg[0]:
            Treg_upcontrol_flag = True
            print('ireg =',ireg)
            print('Treg[ireg] =',Treg[ireg],'[K]')
            print('Abnormal high temperature shows up in the regenerator. The guess of Tptr1 needs an update, e.g., -0.009 K.')
            break
        elif Treg[ireg] < Treg_lowcontrol:
            Treg_lowcontrol_flag = True
            print('ireg =',ireg)
            print('Treg[ireg] =',Treg[ireg],'[K]')
            print('Abnormal low temperature shows up in the regenerator. The guess of Tptr1 needs an update, e.g., +0.01 K.')
            break 
            
        pptr3 = preg[Nreg - 1]
        Uptr3 = Ureg[Nreg - 1] - preg[Nreg - 1] * (1j * omega * Creg[Nreg - 1] + 1.0 / Rkappareg[Nreg - 1]) + Ereg[Nreg - 1] * Ureg[Nreg - 1]
        Anglepptr3 = np.angle(pptr3)/np.pi*180 # [deg]
        AngleUptr3 = np.angle(Uptr3)/np.pi*180 # [deg]
        ADpUptr3 = Anglepptr3-AngleUptr3 # [deg]
        Powerptr3 = 0.5*np.real(pptr3*np.conj(Uptr3)) # [W]
        Hptr3 = Hptr2 # total energy flow rate, [W]
        Tptr3 = Treg[Nreg - 1] + dTmdxreg[Nreg - 1] * (lreg / Nreg) # [K]
        
        ######################################################################################
        ######################################################################################
        
        # (3) Regenerator CHX
        Tregchx = Tptr3 # [K]
        aregchx = a * np.sqrt(Tregchx / 300.0) # [m/s]
        rhomregchx = rhom * 300.0 / Tregchx # [kg/m^3]
        kregchx = k * (Tregchx / 300.0)**0.7 # [W/(m-K)]
        muregchx = mu * (Tregchx / 300.0)**0.7 # [Pa-s]
        
        deltakapparegchx = np.sqrt(2.0 * kregchx / (omega * rhomregchx * cp))
        deltanuregchx = np.sqrt(2.0 * muregchx / (omega * rhomregchx))
    
        arg_k_regchx = (1j - 1.0) * 2.0 * rhregchx / deltakapparegchx
        arg_nu_regchx = (1j - 1.0) * 2.0 * rhregchx / deltanuregchx
    
        fkapparegchx = 2.0 * jv(1, arg_k_regchx) / (jv(0, arg_k_regchx) * arg_k_regchx)
        fnuregchx = 2.0 * jv(1, arg_nu_regchx) / (jv(0, arg_nu_regchx) * arg_nu_regchx)
    
        Lregchx = lregchx * rhomregchx / (Aregchx * phiregchx) * (1.0 - np.real(fnuregchx)) / (abs(1.0 - fnuregchx)**2)
        Rnuregchx = (omega * rhomregchx / Aregchx) * (np.imag(-fnuregchx) / (abs(1.0 - fnuregchx)**2)) * lregchx
        Cregchx = (Aregchx * lregchx * phiregchx) / (aregchx**2 * rhomregchx) * (1.0 + (shr - 1.0) * np.real(fkapparegchx))
        Rkapparegchx = (shr / (shr - 1.0)) * (pm / (omega * Aregchx * phiregchx * np.imag(-fkapparegchx))) / lregchx
    
        deltaLregchx = Lregchx / Nptrhx
        deltaRnuregchx = Rnuregchx / Nptrhx
        deltaCregchx = Cregchx / Nptrhx
        deltaRkapparegchx = Rkapparegchx * Nptrhx
        
        HTCregchx = kregchx/min(deltakapparegchx,rhregchx)*FactorForHTCregchx # convection heat transfer coefficient, [W/(m^2-K)]
        Qregchx = HTCregchx*Aregchx*lregchx/rhregchx*(Tregchxsolid - Tregchx) # heat tranfer rate of reg. AHX, [W]
    
        Uregchx = np.zeros(Nptrhx + 1, dtype=complex)
        pregchx = np.zeros(Nptrhx + 1, dtype=complex)
        Hregchx = np.zeros(Nptrhx + 1)
    
        Uregchx[0] = Uptr3 # volumetric flow rate amplitude at the inlet of the first segment, [m^3/s]
        pregchx[0] = pptr3 - Uregchx[0] * (1j * omega * deltaLregchx + deltaRnuregchx) # pressure amplitude at the outlet of the first segment, [Pa]
        Hregchx[0] = Hptr3 # total energy flow rate at the inlet of the first segment, [W]
    
        for iregchx in range(1, Nptrhx):
            Uregchx[iregchx] = Uregchx[iregchx - 1] - pregchx[iregchx - 1] * (1j * omega * deltaCregchx + 1.0 / deltaRkapparegchx)
            pregchx[iregchx] = pregchx[iregchx - 1] - Uregchx[iregchx] * (1j * omega * deltaLregchx + deltaRnuregchx)
            Hregchx[iregchx] = Hregchx[iregchx - 1] + Qregchx/Nptrhx
    
        pptr4 = pregchx[Nptrhx - 1]
        Uptr4 = Uregchx[Nptrhx - 1] - pregchx[Nptrhx - 1] * (1j * omega * deltaCregchx + 1.0 / deltaRkapparegchx)
        Anglepptr4 = np.angle(pptr4)/np.pi*180 # [deg]
        AngleUptr4 = np.angle(Uptr4)/np.pi*180 # [deg]
        ADpUptr4 = Anglepptr4-AngleUptr4 # [deg]
        Powerptr4 = 0.5*np.real(pptr4*np.conj(Uptr4))
        Hptr4 = Hregchx[Nptrhx - 1] + Qregchx/Nptrhx # total energy flow rate, [W]
        Tptr4 = Tptr3 # temperature, [K]
        
        
        ######################################################################################
        ######################################################################################
        
        # (4) Pulse tube
        Tpt = np.zeros(Npt + 1)
        apt = np.zeros(Npt + 1)
        rhompt = np.zeros(Npt + 1)
        kpt = np.zeros(Npt + 1)
        kptsolid = np.zeros(Npt + 1)
        cptsolid = np.zeros(Npt + 1)
        mupt = np.zeros(Npt + 1)
        deltakappapt = np.zeros(Npt + 1)
        deltanupt = np.zeros(Npt + 1)
        deltakappaptsolid = np.zeros(Npt + 1)
        
        fkappapt = np.zeros(Npt + 1, dtype=complex)
        fnupt = np.zeros(Npt + 1, dtype=complex)
        xipt = np.zeros(Npt + 1, dtype=complex)
        dTmdxpt = np.zeros(Npt + 1)
        
        Lpt = np.zeros(Npt + 1)
        Rnupt = np.zeros(Npt + 1)
        Cpt = np.zeros(Npt + 1)
        Ept = np.zeros(Npt + 1, dtype=complex)
        Rkappapt = np.zeros(Npt + 1)
        
        Upt = np.zeros(Npt + 1, dtype=complex)
        ppt = np.zeros(Npt + 1, dtype=complex)
        AngleUpt = np.zeros(Npt + 1)
        Angleppt = np.zeros(Npt + 1)
        ADpUpt = np.zeros(Npt + 1)
        
        # The first segment of the regenerator CHX
        Tpt[0] = Tptr4 # [K]
        apt[0] = a * np.sqrt(Tpt[0] / 300.0) # [m/s]
        rhompt[0] = rhom * 300.0 / Tpt[0] # [kg/m^3]
        kpt[0] = k * (Tpt[0] / 300.0)**0.7 # [W/(m-K)]
        kptsolid[0] = 3.4372 * np.log(Tpt[0]) - 6.2082 # [W/(m-K)]
        cptsolid[0] = -0.0043 * Tpt[0]**2 + 3.0505 * Tpt[0] - 41.617 # [J/(kg-K)]
        mupt[0] = mu * (Tpt[0] / 300.0)**0.7 # [Pa-s]
        
        deltakappapt[0] = np.sqrt(2.0 * kpt[0] / (omega * rhompt[0] * cp))
        deltanupt[0] = np.sqrt(2.0 * mupt[0] / (omega * rhompt[0]))
        deltakappaptsolid[0] = np.sqrt(2.0 * kptsolid[0] / (omega * rhomptsolid * cptsolid[0]))
        
        arg_k0 = (1j - 1.0) * 2.0 * rhpt / deltakappapt[0]
        arg_nu0 = (1j - 1.0) * 2.0 * rhpt / deltanupt[0]
        
        fkappapt[0] = 2.0 * jv(1, arg_k0) / (jv(0, arg_k0) * arg_k0)
        fnupt[0] = 2.0 * jv(1, arg_nu0) / (jv(0, arg_nu0) * arg_nu0)
        
        xipt[0] = np.sqrt((kpt[0] * rhompt[0] * cp) / (kptsolid[0] * rhomptsolid * cptsolid[0])) * \
                   ((fkappapt[0] * (1.0 + 1j) * rhpt / deltakappapt[0]) / (np.tanh((1.0 + 1j) * rwirept / deltakappaptsolid[0])))
        
        Hpt = Hptr4 # total energy flow rate, [W]
        
        dTmdxpt[0] = (Hpt - 0.5 * np.real(pptr4 * np.conj(Uptr4) * (1.0 - (fkappapt[0] - np.conj(fnupt[0])) / ((1.0 + xipt[0]) * (1.0 + Pr) * (1.0 - np.conj(fnupt[0])))))) / \
                      ((rhompt[0] * cp * (abs(Uptr4)**2) * np.imag(np.conj(fnupt[0]) + (fkappapt[0] - np.conj(fnupt[0])) * (1.0 + xipt[0] * fnupt[0] / fkappapt[0]) / ((1.0 + xipt[0]) * (1.0 + Pr)))) / \
                      (2.0 * Apt * phipt * omega * (1.0 - Pr) * (abs(1.0 - fnupt[0])**2)) - (Apt * phipt * kpt[0] + Apt * (1.0 - phipt) * kptsolid[0] * 0.1))
        
        Lpt[0] = (lpt / Npt) * rhompt[0] / (Apt * phipt) * (1.0 - np.real(fnupt[0])) / (abs(1.0 - fnupt[0])**2)
        Rnupt[0] = (omega * rhompt[0] / (Apt * phipt)) * (np.imag(-fnupt[0]) / (abs(1.0 - fnupt[0])**2)) * (lpt / Npt)
        Cpt[0] = (Apt * (lpt / Npt) * phipt) / (apt[0]**2 * rhompt[0]) * (1.0 + (shr - 1.0) * np.real(fkappapt[0] / (1.0 + xipt[0])))
        Ept[0] = ((fkappapt[0] - fnupt[0]) / ((1.0 - fnupt[0]) * (1.0 - Pr) * (1.0 + xipt[0]))) * (2.0 / (2.0 * Tpt[0] + dTmdxpt[0] * (lpt / Npt))) * dTmdxpt[0] * (lpt / Npt)
        Rkappapt[0] = (shr / (shr - 1.0)) * (pm / (omega * Apt * phipt * np.imag(-fkappapt[0] / (1.0 + xipt[0])))) / (lpt / Npt)
        
        Upt[0] = Uptr4 # at the inlet of the segment
        ppt[0] = pptr4 - Upt[0] * (1j * omega * Lpt[0] + Rnupt[0]) # at the outlet of the segment
        AngleUpt[0] = np.angle(Upt[0])/np.pi*180 # phase angle of U at the inlet of the segment, [deg]
        Angleppt[0] = np.angle(ppt[0])/np.pi*180 # phase angle of p at the outlet of the segment, [deg]
        ADpUpt[0] = Angleppt[0]-AngleUpt[0] # phase difference, angle(p)-angle(U), at the inlet of the segment, [deg] 
        
        # The other segments of the regenerator AHX
        for ipt in range(1, Npt):
            
            Upt[ipt] = Upt[ipt - 1] - ppt[ipt - 1] * (1j * omega * Cpt[ipt - 1] + 1.0 / Rkappapt[ipt - 1]) + Ept[ipt - 1] * Upt[ipt - 1]
            Tpt[ipt] = Tpt[ipt - 1] + dTmdxpt[ipt - 1] * (lpt / Npt)
            
            if Tpt[ipt] < Tpt[0]:
                # Tpt_lowcontrol_flag = True
                # print('ipt =',ipt)
                # print('Tpt[pt] =',Tpt[ipt],'[K]')
                # print('Abnormal low temperature shows up in the pulse tube. The guess of Tptr1 needs an update, e.g., +0.01 K.')
                break
            elif Tpt[ipt] > Tpt_upcontrol:
                # Tpt_upcontrol_flag = True
                # print('ipt =',ipt)
                # print('Tpt[pt] =',Tpt[ipt],'[K]')
                # print('Abnormal high temperature shows up in the pulse tube. The guess of Tptr1 needs an update, e.g., -0.01 K.')
                break
            
            apt[ipt] = a * np.sqrt(Tpt[ipt] / 300.0)
            rhompt[ipt] = rhom * 300.0 / Tpt[ipt]
            kpt[ipt] = k * (Tpt[ipt] / 300.0)**0.7
            kptsolid[ipt] = 3.4372 * np.log(Tpt[ipt]) - 6.2082 # [W/(m-K)]
            cptsolid[ipt] = -0.0043 * Tpt[ipt]**2 + 3.0505 * Tpt[ipt] - 41.617 # [J/(kg-K)]
            mupt[ipt] = mu * (Tpt[ipt] / 300.0)**0.7 # [Pa-s]
            
            deltakappapt[ipt] = np.sqrt(2.0 * kpt[ipt] / (omega * rhompt[ipt] * cp))
            deltanupt[ipt] = np.sqrt(2.0 * mupt[ipt] / (omega * rhompt[ipt]))
            deltakappaptsolid[ipt] = np.sqrt(2.0 * kptsolid[ipt] / (omega * rhomptsolid * cptsolid[ipt]))
            
            arg_ki = (1j - 1.0) * 2.0 * rhpt / deltakappapt[ipt]
            arg_nui = (1j - 1.0) * 2.0 * rhpt / deltanupt[ipt]
            
            fkappapt[ipt] = 2.0 * jv(1, arg_ki) / (jv(0, arg_ki) * arg_ki)
            fnupt[ipt] = 2.0 * jv(1, arg_nui) / (jv(0, arg_nui) * arg_nui)
            
            xipt[ipt] = np.sqrt((kpt[ipt] * rhompt[ipt] * cp) / (kptsolid[ipt] * rhomptsolid * cptsolid[ipt])) * \
                          ((fkappapt[ipt] * (1.0 + 1j) * rhpt / deltakappapt[ipt]) / (np.tanh((1.0 + 1j) * rwirept / deltakappaptsolid[ipt])))
            
            dTmdxpt[ipt] = (Hpt - 0.5 * np.real(ppt[ipt - 1] * np.conj(Upt[ipt]) * (1.0 - (fkappapt[ipt] - np.conj(fnupt[ipt])) / ((1.0 + xipt[ipt]) * (1.0 + Pr) * (1.0 - np.conj(fnupt[ipt])))))) / \
                             ((rhompt[ipt] * cp * (abs(Upt[ipt])**2) * np.imag(np.conj(fnupt[ipt]) + (fkappapt[ipt] - np.conj(fnupt[ipt])) * (1.0 + xipt[ipt] * fnupt[ipt] / fkappapt[ipt]) / ((1.0 + xipt[ipt]) * (1.0 + Pr)))) / \
                             (2.0 * Apt * phipt * omega * (1.0 - Pr) * (abs(1.0 - fnupt[ipt])**2)) - (Apt * phipt * kpt[ipt] + Apt * (1.0 - phipt) * kptsolid[ipt] * 0.1))
                             
            Lpt[ipt] = (lpt / Npt) * rhompt[ipt] / (Apt * phipt) * (1.0 - np.real(fnupt[ipt])) / (abs(1.0 - fnupt[ipt])**2)
            Rnupt[ipt] = (omega * rhompt[ipt] / (Apt * phipt)) * (np.imag(-fnupt[ipt]) / (abs(1.0 - fnupt[ipt])**2)) * (lpt / Npt)
            Cpt[ipt] = (Apt * (lpt / Npt) * phipt) / (apt[ipt]**2 * rhompt[ipt]) * (1.0 + (shr - 1.0) * np.real(fkappapt[ipt] / (1.0 + xipt[ipt])))
            Ept[ipt] = ((fkappapt[ipt] - fnupt[ipt]) / ((1.0 - fnupt[ipt]) * (1.0 - Pr) * (1.0 + xipt[ipt]))) * (2.0 / (2.0 * Tpt[ipt] + dTmdxpt[ipt] * (lpt / Npt))) * dTmdxpt[ipt] * (lpt / Npt)
            Rkappapt[ipt] = (shr / (shr - 1.0)) * (pm / (omega * Apt * phipt * np.imag(-fkappapt[ipt] / (1.0 + xipt[ipt])))) / (lpt / Npt)
            
            ppt[ipt] = ppt[ipt - 1] - Upt[ipt] * (1j * omega * Lpt[ipt] + Rnupt[ipt])
        
            AngleUpt[ipt] = np.angle(Upt[ipt])/np.pi*180 # phase angle of U at the inlet of the segment, [deg]
            Angleppt[ipt] = np.angle(ppt[ipt])/np.pi*180 # phase angle of p at the outlet of the segment, [deg]
            ADpUpt[ipt] = Angleppt[ipt-1]-AngleUpt[ipt] # phase difference, angle(p)-angle(U), at the inlet of the segment, [deg]
    
        if Tpt[ipt] < Tpt[0]:
            Tpt_lowcontrol_flag = True
            print('ipt =',ipt)
            print('Tpt[pt] =',Tpt[ipt],'[K]')
            print('Abnormal low temperature shows up in the pulse tube. The guess of Tptr1 needs an update, e.g., +0.01 K.')
            break
        elif Tpt[ipt] > Tpt_upcontrol:
            Tpt_upcontrol_flag = True
            print('ipt =',ipt)
            print('Tpt[pt] =',Tpt[ipt],'[K]')
            print('Abnormal high temperature shows up in the pulse tube. The guess of Tptr1 needs an update, e.g., -0.009 K.')
            break
        
        pptr5 = ppt[Npt - 1]
        Uptr5 = Upt[Npt - 1] - ppt[Npt - 1] * (1j * omega * Cpt[Npt - 1] + 1.0 / Rkappapt[Npt - 1]) + Ept[Npt - 1] * Upt[Npt - 1]
        Anglepptr5 = np.angle(pptr5)/np.pi*180 # [deg]
        AngleUptr5 = np.angle(Uptr5)/np.pi*180 # [deg]
        ADpUptr5 = Anglepptr5-AngleUptr5 # [deg]
        Powerptr5 = 0.5*np.real(pptr5*np.conj(Uptr5))
        Hptr5 = Hpt # total energy flow rate, [W]
        Tptr5 = Tpt[Npt - 1] + dTmdxpt[Npt - 1] * (lpt / Npt)
        
        ######################################################################################
        ######################################################################################
        
        # (5) Pulse tube AHX
        Tptahx = Tptr5 # [K]
        aptahx = a * np.sqrt(Tptahx / 300.0) # [m/s]
        rhomptahx = rhom * 300.0 / Tptahx # [kg/m^3]
        kptahx = k * (Tptahx / 300.0)**0.7 # [W/(m-K)]
        muptahx = mu * (Tptahx / 300.0)**0.7 # [Pa-s]
        
        deltakappaptahx = np.sqrt(2.0 * kptahx / (omega * rhomptahx * cp))
        deltanuptahx = np.sqrt(2.0 * muptahx / (omega * rhomptahx))
    
        arg_k_ptahx = (1j - 1.0) * 2.0 * rhptahx / deltakappaptahx
        arg_nu_ptahx = (1j - 1.0) * 2.0 * rhptahx / deltanuptahx
    
        fkappaptahx = 2.0 * jv(1, arg_k_ptahx) / (jv(0, arg_k_ptahx) * arg_k_ptahx)
        fnuptahx = 2.0 * jv(1, arg_nu_ptahx) / (jv(0, arg_nu_ptahx) * arg_nu_ptahx)
    
        Lptahx = lptahx * rhomptahx / (Aptahx * phiptahx) * (1.0 - np.real(fnuptahx)) / (abs(1.0 - fnuptahx)**2)
        Rnuptahx = (omega * rhomptahx / Aptahx) * (np.imag(-fnuptahx) / (abs(1.0 - fnuptahx)**2)) * lptahx
        Cptahx = (Aptahx * lptahx * phiptahx) / (aptahx**2 * rhomptahx) * (1.0 + (shr - 1.0) * np.real(fkappaptahx))
        Rkappaptahx = (shr / (shr - 1.0)) * (pm / (omega * Aptahx * phiptahx * np.imag(-fkappaptahx))) / lptahx
    
        deltaLptahx = Lptahx / Nptrhx
        deltaRnuptahx = Rnuptahx / Nptrhx
        deltaCptahx = Cptahx / Nptrhx
        deltaRkappaptahx = Rkappaptahx * Nptrhx
        
        HTCptahx = kptahx/min(deltakappaptahx,rhptahx)*FactorForHTCptahx # convection heat transfer coefficient, [W/(m^2-K)]
        Qptahx = HTCptahx*Aptahx*lptahx/rhptahx*(Tptahxsolid - Tptahx) # heat tranfer rate of reg. AHX, [W]
    
        Uptahx = np.zeros(Nptrhx + 1, dtype=complex)
        pptahx = np.zeros(Nptrhx + 1, dtype=complex)
        Hptahx = np.zeros(Nptrhx + 1)
    
        Uptahx[0] = Uptr5 # volumetric flow rate amplitude at the inlet of the first segment, [m^3/s]
        pptahx[0] = pptr5 - Uptahx[0] * (1j * omega * deltaLptahx + deltaRnuptahx) # pressure amplitude at the outlet of the first segment, [Pa]
        Hptahx[0] = Hptr5 # total energy flow rate at the inlet of the first segment, [W]
    
        for iptahx in range(1, Nptrhx):
            Uptahx[iptahx] = Uptahx[iptahx - 1] - pptahx[iptahx - 1] * (1j * omega * deltaCptahx + 1.0 / deltaRkappaptahx)
            pptahx[iptahx] = pptahx[iptahx - 1] - Uptahx[iptahx] * (1j * omega * deltaLptahx + deltaRnuptahx)
            Hptahx[iptahx] = Hptahx[iptahx - 1] + Qptahx/Nptrhx
    
        pptr6 = pptahx[Nptrhx - 1]
        Uptr6 = Uptahx[Nptrhx - 1] - pptahx[Nptrhx - 1] * (1j * omega * deltaCptahx + 1.0 / deltaRkappaptahx)
        Anglepptr6 = np.angle(pptr6)/np.pi*180 # [deg]
        AngleUptr6 = np.angle(Uptr6)/np.pi*180 # [deg]
        ADpUptr6 = Anglepptr6-AngleUptr6 # [deg]
        Powerptr6 = 0.5*np.real(pptr6*np.conj(Uptr6))
        Hptr6 = Hptahx[Nptrhx - 1] + Qptahx/Nptrhx # total energy flow rate, [W]
        Tptr6 = Tptr5 # temperature, [K]
            
        errorHptr6 = Hptr6
        
        # print('Hptr6 =',Hptr6,'[W]')
        # print('Powerptr6 =',Powerptr6,'[W]')
        print('errorHptr6 =',errorHptr6,'[W]')
        print('Tptr1 =',Tptr1,'[K]')
        # print('Q_dot_c =',Hptr4-Hptr3,'[W]')
        print('####################################################')

Q_dot_c = Hptr4-Hptr3 # refrigeration capacity, [W]
COP = Q_dot_c/Powerptr # COP


# ---------------------------------------------------------
# 5. Outputs of simulation results
# ---------------------------------------------------------

print('Q_dot_c =',Q_dot_c,'[W]')
print('COP =',COP, '[-]')

# Plots
# Determine the x coordication for each segment long the ptr
x_array = [0] # for reg. AHX
for iregahx in range(1, Nptrhx+1): # for reg. AHX
    x_array.append(lregahx/Nptrhx*iregahx)
for ireg in range(1, Nreg+1): # for reg.
    x_array.append(lregahx+lreg/Nreg*ireg)
for iregchx in range(1, Nptrhx+1): # for reg. cHX
    x_array.append(lregahx+lreg+lregchx/Nptrhx*iregchx)
for ipt in range(1, Npt+1): # for pt
    x_array.append(lregahx+lreg+lregchx+lpt/Npt*ipt)
for iptahx in range(1, Nptrhx+1): # for reg. AHX
    x_array.append(lregahx+lreg+lregchx+lpt+lptahx/Nptrhx*iptahx) 

# Parameters of interest    
# The pressure which is at the outlet of each segment.
p_array = [pptr1]
p_array = np.append(p_array,pregahx)
p_array = p_array[:-1]
p_array = np.append(p_array,preg)
p_array = p_array[:-1]
p_array = np.append(p_array,pregchx)
p_array = p_array[:-1]
p_array = np.append(p_array,ppt)
p_array = p_array[:-1]
p_array = np.append(p_array,pptahx)
p_array = p_array[:-1]

# All other parameters are at the inlet of each segment.
U_array = Uregahx
U_array = U_array[:-1]
U_array = np.append(U_array,Ureg)
U_array = U_array[:-1]
U_array = np.append(U_array,Uregchx)
U_array = U_array[:-1]
U_array = np.append(U_array,Upt)
U_array = U_array[:-1]
U_array = np.append(U_array,Uptahx)
U_array[-1] = Uptr6

H_array = Hregahx
H_array = H_array[:-1]
H_array = np.append(H_array,np.full(100,Hreg))
H_array = np.append(H_array,Hregchx)
H_array = H_array[:-1]
H_array = np.append(H_array,np.full(100,Hpt))
H_array = np.append(H_array,Hptahx)
H_array[-1] = Hptr6

T_array = np.array([Tregahx,Tregahx,Tregahx,Tregahx,Tregahx,Tregahx,Tregahx,Tregahx,Tregahx,Tregahx])
T_array = np.append(T_array,Treg)
T_array = T_array[:-1]
T_array = np.append(T_array,[Tregchx,Tregchx,Tregchx,Tregchx,Tregchx,Tregchx,Tregchx,Tregchx,Tregchx,Tregchx])
T_array = np.append(T_array,Tpt)
T_array = T_array[:-1]
T_array = np.append(T_array,[Tptahx,Tptahx,Tptahx,Tptahx,Tptahx,Tptahx,Tptahx,Tptahx,Tptahx,Tptahx])
T_array = np.append(T_array,Tptr6)

Tsolid_array = np.array([Tregahxsolid,Tregahxsolid,Tregahxsolid,Tregahxsolid,Tregahxsolid,Tregahxsolid,Tregahxsolid,Tregahxsolid,Tregahxsolid,Tregahxsolid])
Tsolid_array = np.append(Tsolid_array,Treg)
Tsolid_array[-1] = Tregchxsolid
Tsolid_array = np.append(Tsolid_array,[Tregchxsolid,Tregchxsolid,Tregchxsolid,Tregchxsolid,Tregchxsolid,Tregchxsolid,Tregchxsolid,Tregchxsolid,Tregchxsolid])
Tsolid_array = np.append(Tsolid_array,Tpt)
Tsolid_array[-1] = Tptahx
Tsolid_array = np.append(Tsolid_array,[Tptahxsolid,Tptahxsolid,Tptahxsolid,Tptahxsolid,Tptahxsolid,Tptahxsolid,Tptahxsolid,Tptahxsolid,Tptahxsolid])
Tsolid_array = np.append(Tsolid_array,Tptahxsolid)

Anglep_array = np.zeros(p_array.size)
Absp_array = np.zeros(p_array.size)
AngleU_array = np.zeros(U_array.size)
AbsU_array = np.zeros(U_array.size)
ADpU_array = np.zeros(p_array.size)
Power_array = np.zeros(p_array.size)
for i in range(U_array.size):
    Anglep_array[i] = np.angle(p_array[i])/np.pi*180 # [deg]
    Absp_array[i] = np.abs(p_array[i])/100000 # [bar]
    AngleU_array[i] = np.angle(U_array[i])/np.pi*180 # [deg]
    AbsU_array[i] = np.abs(U_array[i])*10000 # [x 10^-4 m^3/s]
    ADpU_array[i] = Anglep_array[i] - AngleU_array[i] # [deg]
    Power_array[i] = 0.5*np.real(p_array[i]*np.conj(U_array[i])) # [W]
    
# Anglep, AngleU, and ADpU
plt.plot(x_array,Anglep_array,'-r')
plt.plot(x_array,AngleU_array,'-b')
plt.plot(x_array,ADpU_array,'-g')
plt.annotate('Anglep',xy=(x_array[i],Anglep_array[i]),xytext=(x_array[i]+0.002,Anglep_array[i]-2),fontsize=12,color='r') 
plt.annotate('AngleU',xy=(x_array[i],AngleU_array[i]),xytext=(x_array[i]+0.002,AngleU_array[i]-2),fontsize=12,color='b') 
plt.annotate('ADpU',xy=(x_array[i],ADpU_array[i]),xytext=(x_array[i]+0.002,ADpU_array[i]-2),fontsize=12,color='g')
plt.axis([0,0.25,-80,80])
plt.tick_params(tickdir='in')
plt.xlabel('x [m]',fontsize=12)
plt.ylabel('Anglep, AngleU, or ADpU [deg]',fontsize=12)
plt.show()

# Absp and AbsU
plt.plot(x_array,Absp_array,'-r')
plt.plot(x_array,AbsU_array,'-b')
plt.annotate('Absp',xy=(x_array[i],Absp_array[i]),xytext=(x_array[i]+0.002,Absp_array[i]-0.1),fontsize=12,color='r') 
plt.annotate('AbsU',xy=(x_array[i],AbsU_array[i]),xytext=(x_array[i]+0.002,AbsU_array[i]-0.1),fontsize=12,color='b') 
plt.axis([0,0.25,0,16])
plt.tick_params(tickdir='in')
plt.xlabel('x [m]',fontsize=12)
plt.ylabel('Absp [bar] or AbsU [x 10^-4 m^3/s]',fontsize=12)
plt.show()

# Tm and Tsolid
plt.plot(x_array,T_array,'-r')
plt.plot(x_array,Tsolid_array,'-b')
plt.annotate('Tm',xy=(x_array[i],T_array[i]),xytext=(x_array[i]+0.002,T_array[i]-3),fontsize=12,color='r') 
plt.annotate('Tsolid',xy=(x_array[i],Tsolid_array[i]),xytext=(x_array[i]+0.002,Tsolid_array[i]-5),fontsize=12,color='b') 
plt.axis([0,0.25,0,400])
plt.tick_params(tickdir='in')
plt.xlabel('x [m]',fontsize=12)
plt.ylabel('Tm or Tsolid [K]',fontsize=12)
plt.show()

# Tm and Tsolid for REGCHX
plt.plot(x_array,T_array,'-r')
plt.plot(x_array,Tsolid_array,'-b')
plt.annotate('Tm',xy=(x_array[i],T_array[i]),xytext=(x_array[i]+0.002,T_array[i]-3),fontsize=12,color='r') 
plt.annotate('Tsolid',xy=(x_array[i],Tsolid_array[i]),xytext=(x_array[i]+0.002,Tsolid_array[i]-5),fontsize=12,color='b') 
plt.axis([0.05,0.1,96,102])
plt.tick_params(tickdir='in')
plt.xticks(fontsize=16)
plt.yticks(fontsize=16)
plt.xlabel('x [m]',fontsize=16)
plt.ylabel('Tm or Tsolid [K]',fontsize=16)
plt.show()

# Power and H
plt.plot(x_array,Power_array,'-r')
plt.plot(x_array,H_array,'-b')
plt.annotate('Power',xy=(x_array[i],Power_array[i]),xytext=(x_array[i]+0.002,Power_array[i]-1),fontsize=12,color='r') 
plt.annotate('H',xy=(x_array[i],H_array[i]),xytext=(x_array[i]+0.002,H_array[i]-1),fontsize=12,color='b') 
plt.axis([0,0.25,0,200])
plt.tick_params(tickdir='in')
plt.xlabel('x [m]',fontsize=12)
plt.ylabel('Power or H [W]',fontsize=12)
plt.show()