# -*- coding: utf-8 -*-
"""
An ideal vapor-compression refrigeration cycle has R134a as the refrigerant. 
The saturated R134a vapor exits the evaporator at 10 ˚C and the saturated 
R134a liquid exits the condenser at 40 ˚C. Plot the T-s, p-h, and T-h diagram 
of this cycle by coding in Python. The saturated liquid line and the saturated 
vapor line must be shown in the figure. The axes must be properly labeled, 
and the number labels of the states must be presented in the figure.

Programmed by Ke Tang
Update date: 6-22-24
"""

import CoolProp.CoolProp as CP
import matplotlib.pyplot as plt

# Fluid of interest
fld = 'R134a' # [-]

##############################################################################
##############################################################################

# To find out the T, P, s, and h data for the diagrams

# Known
T_1 = 10 # temperature, [C]
x_1 = 1 # vapor qulity, [-]
T_3 = 40 # temperature, [C]
x_3 = 0 # vapor quality, [-]

# State 1
P_1 = CP.PropsSI('P','T',T_1+273.15,'Q',x_1,fld)/1000 # pressure, [kPa]
h_1 = CP.PropsSI('H','T',T_1+273.15,'Q',x_1,fld)/1000 # specific enthalpy, [kJ/kg]
s_1 = CP.PropsSI('S','T',T_1+273.15,'Q',x_1,fld)/1000 # specific entropy, [kJ/(kg-K)]


# State 3
P_3 = CP.PropsSI('P','T',T_3+273.15,'Q',x_3,fld)/1000 # pressure, [kPa]
h_3 = CP.PropsSI('H','T',T_3+273.15,'Q',x_3,fld)/1000 # specific enthalpy, [kJ/kg]
s_3 = CP.PropsSI('S','T',T_3+273.15,'Q',x_3,fld)/1000 # specific entropy, [kJ/(kg-K)]

# State 2
P_2 = P_3 # pressure, [kPa]
s_2 = s_1 # specific entropy, [kJ/(kg-K)]
T_2 = CP.PropsSI('T','P',P_2*1000,'S',s_2*1000,fld)-273.15 # temperature, [C]
h_2 = CP.PropsSI('H','P',P_2*1000,'S',s_2*1000,fld)/1000 # specific enthalpy, [kJ/kg]

# State 4
P_4 = P_1 # pressure, [kPa]
h_4 = h_3 # specific enthalpy, [kJ/kg]
T_4 = CP.PropsSI('T','P',P_4*1000,'H',h_4*1000,fld)-273.15 # temperature, [C]
s_4 = CP.PropsSI('S','P',P_4*1000,'H',h_4*1000,fld)/1000 # specific entropy, [kJ/(kg-K)]

# State a: saturated vapor at condensing pressure
x_a = 1 # vapor quality, [-]
T_a = T_3 # temperature, [C]
P_a = P_3 # pressure, [kPa]
h_a = CP.PropsSI('H','T',T_a+273.15,'Q',x_a,fld)/1000 # specific enthalpy, [kJ/kg]
s_a = CP.PropsSI('S','T',T_a+273.15,'Q',x_a,fld)/1000 # specific entropy, [kJ/(kg-K)]

# Arrays for plotting the diagrams
T = [T_1,T_2,T_a,T_3,T_4,T_1]
P = [P_1,P_2,P_a,P_3,P_4,P_1]
s = [s_1,s_2,s_a,s_3,s_4,s_1]
h = [h_1,h_2,h_a,h_3,h_4,h_1]

# Print the data for the diagrams
print('T =',T,'[C]')
print('P =',P,'[kPa]')
print('s =',s,'[kJ/(kg-K)]')
print('h =',h,'[kJ/kg]')

##############################################################################
##############################################################################

# To find the data of the saturated liquid line and the saturated vapor line

# Temperature
T_lowerlimit = -30 # temperature, [C]
T_higherlimit = 90 #temperature, [C]

# Steps for T 
deltaT = 1 # [C]

# Initialization
i = 0
T_l = [T_lowerlimit] # [C]
T_v = [T_lowerlimit] # [C]
P_l = [CP.PropsSI('P','T',T_l[i]+273.15,'Q',0,fld)/1000] # pressure, [kPa]
P_v = [CP.PropsSI('P','T',T_v[i]+273.15,'Q',1,fld)/1000] # pressure, [kPa]
s_l = [CP.PropsSI('S','T',T_l[i]+273.15,'Q',0,fld)/1000] # specific entropy, [kJ/(kg-K)]
s_v = [CP.PropsSI('S','T',T_v[i]+273.15,'Q',1,fld)/1000] # specific entropy, [kJ/(kg-K)]
h_l = [CP.PropsSI('H','T',T_l[i]+273.15,'Q',0,fld)/1000] # specific enthalpy, [kJ/kg]
h_v = [CP.PropsSI('H','T',T_v[i]+273.15,'Q',1,fld)/1000] # specific enthalpy, [kJ/kg]

while i < T_higherlimit-T_lowerlimit:
    
    i = i+1
    T_l.append(0),T_v.append(0),P_l.append(0),P_v.append(0),
    s_l.append(0),s_v.append(0),h_l.append(0),h_v.append(0)
    
    # For subcooled liquid
    T_l[i] = T_l[i-1]+deltaT # [C]
    T_v[i] = T_v[i-1]+deltaT # [C]
    P_l[i] = CP.PropsSI('P','T',T_l[i]+273.15,'Q',0,fld)/1000 # pressure, [kPa]
    P_v[i] = CP.PropsSI('P','T',T_v[i]+273.15,'Q',1,fld)/1000 # pressure, [kPa]
    s_l[i] = CP.PropsSI('S','T',T_l[i]+273.15,'Q',0,fld)/1000 # specific entropy, [kJ/(kg-K)]
    s_v[i] = CP.PropsSI('S','T',T_v[i]+273.15,'Q',1,fld)/1000 # specific entropy, [kJ/(kg-K)]
    h_l[i] = CP.PropsSI('H','T',T_l[i]+273.15,'Q',0,fld)/1000 # specific enthalpy, [kJ/kg]
    h_v[i] = CP.PropsSI('H','T',T_v[i]+273.15,'Q',1,fld)/1000 # specific enthalpy, [kJ/kg]

##############################################################################
##############################################################################

# Plot the diagrams
# T-s diagram
plt.plot(s_l,T_l,'--g')
plt.plot(s_v,T_v,'--g')
plt.plot(s,T,'-ob',markersize=4)
plt.annotate('1',xy=(s_1,T_1),xytext=(s_1+0.01,T_1-1),fontsize=14,color='b') 
plt.annotate('2',xy=(s_2,T_2),xytext=(s_2+0.01,T_2-1),fontsize=14,color='b') 
plt.annotate('3',xy=(s_3,T_3),xytext=(s_3-0.05,T_3-1),fontsize=14,color='b')
plt.annotate('4',xy=(s_4,T_4),xytext=(s_4-0.05,T_4-1),fontsize=14,color='b')
plt.axis([0.8,2,-10,70])
plt.tick_params(tickdir='in')
plt.xlabel('s [kJ/(kg-K)]',fontsize=14)
plt.ylabel('T [°C]',fontsize=14)
plt.show()

# p-h diagram
plt.plot(h_l,P_l,'--g')
plt.plot(h_v,P_v,'--g')
plt.plot(h,P,'-ob',markersize=4)
plt.annotate('1',xy=(h_1,P_1),xytext=(h_1+3,P_1-20),fontsize=14,color='b') 
plt.annotate('2',xy=(h_2,P_2),xytext=(h_2+3,P_2-20),fontsize=14,color='b') 
plt.annotate('3',xy=(h_3,P_3),xytext=(h_3-15,P_3-20),fontsize=14,color='b')
plt.annotate('4',xy=(h_4,P_4),xytext=(h_4-15,P_4-20),fontsize=14,color='b')
plt.axis([150,500,100,3000])
plt.yscale('log',base=10)
plt.tick_params(tickdir='in')
plt.xlabel('h [kJ/kg]',fontsize=14)
plt.ylabel('p [kPa]',fontsize=14)
plt.show()

# T-h diagram
plt.plot(h_l,T_l,'--g')
plt.plot(h_v,T_v,'--g')
plt.plot(h,T,'-ob',markersize=4)
plt.annotate('1',xy=(h_1,T_1),xytext=(h_1+3,T_1-1),fontsize=14,color='b') 
plt.annotate('2',xy=(h_2,T_2),xytext=(h_2+3,T_2-1),fontsize=14,color='b') 
plt.annotate('3',xy=(h_3,T_3),xytext=(h_3-15,T_3-1),fontsize=14,color='b')
plt.annotate('4',xy=(h_4,T_4),xytext=(h_4-15,T_4-1),fontsize=14,color='b')
plt.axis([150,500,-10,70])
plt.tick_params(tickdir='in')
plt.xlabel('h [kJ/kg]',fontsize=14)
plt.ylabel('T [°C]',fontsize=14)
plt.show()