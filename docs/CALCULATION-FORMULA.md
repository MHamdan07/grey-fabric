# Grey Fabric Costing — Textile Engineering Calculation Formulas

This document outlines the standard mathematical formulas used by the **Grey Fabric Costing Engine** based on the English Cotton Count ($N_e$) system.

---

## 1. Textile Constant Derivation

In the English Cotton Count ($N_e$) system:
- **1 Hank** = 840 yards
- **1 Pound (lb)** = 453.59237 grams = 0.45359237 kg
- **1 Meter** = 1.0936133 yards
- **1 Kilogram** = 2.2046226 lbs

The theoretical weight of 1 yard of $1\text{s } N_e$ yarn is $\frac{1}{840} \text{ lb}$.  
For yarn of count $N_e$, the weight of 1 meter in kilograms is:

$$\text{Weight (kg/mtr)} = \frac{1.0936133}{840 \times N_e \times 2.2046226} = \frac{1}{N_e \times 1693.33}$$

Hence, the **Standard Textile Engineering Constant** is:
$$\mathbf{K = 1693.33}$$

---

## 2. Warp Yarn Weight & Cost

### Inputs:
- $\text{Width}$ = Fabric Width in inches
- $\text{EPI}$ = Ends Per Inch
- $\text{Warp Count } (N_e)$ = Warp yarn count
- $\text{Warp Rate}$ = Cost per kg of warp yarn
- $\text{Warp Wastage \%}$ = Crimp contraction + sizing waste (typically 3.0% - 5.0%)

### Equations:
1. **Total Warp Ends**:
   $$\text{Total Ends} = \text{Width} \times \text{EPI}$$
2. **Base Warp Weight (kg/meter)**:
   $$\text{Base Warp Weight} = \frac{\text{Total Ends}}{\text{Warp Count} \times 1693.33}$$
3. **Gross Warp Weight (kg/meter with Wastage)**:
   $$\text{Gross Warp Weight} = \text{Base Warp Weight} \times \left(1 + \frac{\text{Warp Wastage \%}}{100}\right)$$
4. **Warp Cost / Meter**:
   $$\text{Warp Cost} = \text{Gross Warp Weight} \times \text{Warp Rate}$$
5. **Warp Wastage Cost / Meter**:
   $$\text{Warp Wastage Cost} = (\text{Gross Warp Weight} - \text{Base Warp Weight}) \times \text{Warp Rate}$$

---

## 3. Weft Yarn Weight & Cost

### Inputs:
- $\text{PPI}$ = Picks Per Inch
- $\text{Width}$ = Fabric Width in inches
- $\text{Weft Count } (N_e)$ = Weft yarn count
- $\text{Weft Rate}$ = Cost per kg of weft yarn
- $\text{Weft Wastage \%}$ = Crimp contraction + loom waste (typically 3.5% - 5.5%)

### Equations:
1. **Base Weft Weight (kg/meter)**:
   $$\text{Base Weft Weight} = \frac{\text{PPI} \times \text{Width}}{\text{Weft Count} \times 1693.33}$$
2. **Gross Weft Weight (kg/meter with Wastage)**:
   $$\text{Gross Weft Weight} = \text{Base Weft Weight} \times \left(1 + \frac{\text{Weft Wastage \%}}{100}\right)$$
3. **Weft Cost / Meter**:
   $$\text{Weft Cost} = \text{Gross Weft Weight} \times \text{Weft Rate}$$
4. **Weft Wastage Cost / Meter**:
   $$\text{Weft Wastage Cost} = (\text{Gross Weft Weight} - \text{Base Weft Weight}) \times \text{Weft Rate}$$

---

## 4. Fabric Physical Metrics (GSM & GLM)

1. **Total Gross Weight (kg/meter)**:
   $$\text{Total Fabric Weight} = \text{Gross Warp Weight} + \text{Gross Weft Weight}$$
2. **GLM (Grams per Linear Meter)**:
   $$\text{GLM} = \text{Total Fabric Weight (kg)} \times 1000$$
3. **GSM (Grams per Square Meter)**:
   $$\text{Width in Meters} = \text{Width (inches)} \times 0.0254$$
   $$\text{GSM} = \frac{\text{GLM}}{\text{Width in Meters}}$$
4. **Ounces per Square Yard ($oz/yd^2$)**:
   $$\text{Oz} = \frac{\text{GSM}}{33.906}$$

---

## 5. Process Charges & Net Grey Fabric Cost / Meter

$$\text{Total Process Charges} = \text{Sizing Charges} + \text{Weaving Charges} + \text{Other Process Charges}$$

$$\mathbf{\text{GREY FABRIC COST / METER} = \text{Warp Cost} + \text{Weft Cost} + \text{Total Process Charges}}$$

### Worked Example (PKR / Pakistani Rupee):
- Fabric: $40 \times 40 \text{ / } 133 \times 72 \times 63"$ Poplin
- Warp Rate: Rs. 1,120/kg, Wastage: 3.5%
- Weft Rate: Rs. 1,080/kg, Wastage: 4.0%
- Sizing: Rs. 14.50/m, Weaving: Rs. 32.00/m, Other: Rs. 5.50/m

1. **Total Ends**: $63 \times 133 = 8379$
2. **Base Warp Wt**: $\frac{8379}{40 \times 1693.33} = 0.1237 \text{ kg/m}$
3. **Gross Warp Wt**: $0.1237 \times 1.035 = 0.1280 \text{ kg/m}$
4. **Warp Cost**: $0.1280 \times 1120 = \mathbf{\text{Rs. } 143.36/m}$
5. **Base Weft Wt**: $\frac{72 \times 63}{40 \times 1693.33} = 0.0670 \text{ kg/m}$
6. **Gross Weft Wt**: $0.0670 \times 1.04 = 0.0697 \text{ kg/m}$
7. **Weft Cost**: $0.0697 \times 1080 = \mathbf{\text{Rs. } 75.28/m}$
8. **Total Process**: $14.50 + 32.00 + 5.50 = \mathbf{\text{Rs. } 52.00/m}$
9. **GLM / GSM**: $197.7 \text{ g/m} \rightarrow \mathbf{123.5 \text{ g/m}^2}$
10. **Grey Fabric Cost / Meter**: $143.36 + 75.28 + 52.00 = \mathbf{\text{Rs. } 270.64 / \text{meter}}$
