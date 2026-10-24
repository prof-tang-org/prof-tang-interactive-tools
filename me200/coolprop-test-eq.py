"""
coolprop-test-eq.py
Python calculation engine for thermophysical properties evaluation using CoolProp.
Demonstrates the pythonScript calculation engine integration in inputOutput.
"""

import CoolProp.CoolProp as CP

def calculate(inputs):
    """
    Calculation engine function.
    Receives interactive inputs dictionary:
      inputs["fluid"]: string, e.g. "Water", "R134a", "Air", "CO2"
      inputs["temp"]: float, temperature in degC
      inputs["pressure"]: float, pressure in bar
    Returns dictionary of computed properties.
    """
    fluid = str(inputs.get("fluid", "Water"))
    temp_c = float(inputs.get("temp", 100))
    pressure_bar = float(inputs.get("pressure", 2.0))

    # Convert units to SI (Kelvin, Pascal)
    T_K = temp_c + 273.15
    P_Pa = pressure_bar * 1e5

    # Density (kg/m³)
    try:
        rho = CP.PropsSI('D', 'T', T_K, 'P', P_Pa, fluid)
    except Exception:
        rho = float('nan')

    # Specific Enthalpy (kJ/kg)
    try:
        h_J = CP.PropsSI('H', 'T', T_K, 'P', P_Pa, fluid)
        enthalpy = h_J / 1000.0
    except Exception:
        enthalpy = float('nan')

    # Specific Entropy (kJ/kg·K)
    try:
        s_J = CP.PropsSI('S', 'T', T_K, 'P', P_Pa, fluid)
        entropy = s_J / 1000.0
    except Exception:
        entropy = float('nan')

    # Specific Internal Energy (kJ/kg)
    try:
        u_J = CP.PropsSI('U', 'T', T_K, 'P', P_Pa, fluid)
        internal_energy = u_J / 1000.0
    except Exception:
        internal_energy = float('nan')

    # Specific heat at constant pressure Cp (kJ/kg·K)
    try:
        cp_J = CP.PropsSI('C', 'T', T_K, 'P', P_Pa, fluid)
        cp = cp_J / 1000.0
    except Exception:
        cp = float('nan')

    # Specific heat at constant volume Cv (kJ/kg·K)
    try:
        cv_J = CP.PropsSI('O', 'T', T_K, 'P', P_Pa, fluid)
        cv = cv_J / 1000.0
    except Exception:
        cv = float('nan')

    # Speed of sound (m/s)
    try:
        speed_sound = CP.PropsSI('A', 'T', T_K, 'P', P_Pa, fluid)
    except Exception:
        speed_sound = float('nan')

    return {
        "rho": rho,
        "enthalpy": enthalpy,
        "entropy": entropy,
        # Additional properties computed by Python engine (available in state, but not necessarily rendered as UI cards):
        "internal_energy": internal_energy,
        "cp": cp,
        "cv": cv,
        "speed_of_sound": speed_sound
    }
