# HOAI Compliance Coding Skill

## Overview

HOAI (Honorarordnung für Architekten und Ingenieure) is the mandatory fee structure for architects and engineers in Germany. This skill teaches how to implement HOAI compliance directly into code, ensuring every construction-related operation adheres to German regulations.

## Understanding HOAI Phases

### The 9 Service Phases (Leistungsphasen)
```javascript
const HOAI_PHASES = {
    LP1: {
        name: 'Grundlagenermittlung',
        description: 'Basic Evaluation',
        percentage: 2,
        requiredDeliverables: [
            'Bedarfsplanung',
            'Standortanalyse',
            'Beteiligtenanalyse'
        ]
    },
    LP2: {
        name: 'Vorplanung',
        description: 'Preliminary Planning',
        percentage: 7,
        requiredDeliverables: [
            'Planungskonzept',
            'Vorentwurf',
            'Kostenschätzung_DIN276'
        ]
    },
    LP3: {
        name: 'Entwurfsplanung',
        description: 'Draft Planning',
        percentage: 15,
        requiredDeliverables: [
            'Entwurf',
            'Kostenberechnung_DIN276',
            'Terminplan'
        ]
    },
    LP4: {
        name: 'Genehmigungsplanung',
        description: 'Approval Planning',
        percentage: 3,
        requiredDeliverables: [
            'Bauantrag',
            'Genehmigungsunterlagen',
            'Nachweise'
        ]
    },
    LP5: {
        name: 'Ausführungsplanung',
        description: 'Execution Planning',
        percentage: 25,
        requiredDeliverables: [
            'Ausführungspläne',
            'Detailpläne',
            'Konstruktionsdetails'
        ]
    },
    LP6: {
        name: 'Vorbereitung der Vergabe',
        description: 'Tender Preparation',
        percentage: 10,
        requiredDeliverables: [
            'Leistungsverzeichnis',
            'Mengenermittlung',
            'Ausschreibungsunterlagen'
        ]
    },
    LP7: {
        name: 'Mitwirkung bei der Vergabe',
        description: 'Tender Support',
        percentage: 4,
        requiredDeliverables: [
            'Angebotsauswertung',
            'Vergabevorschlag',
            'Auftragserteilung'
        ]
    },
    LP8: {
        name: 'Objektüberwachung',
        description: 'Construction Supervision',
        percentage: 32,
        requiredDeliverables: [
            'Bauüberwachung',
            'Dokumentation',
            'Abnahmeprotokoll'
        ]
    },
    LP9: {
        name: 'Objektbetreuung',
        description: 'Object Support',
        percentage: 2,
        requiredDeliverables: [
            'Gewährleistungsverfolgung',
            'Objektbegehung',
            'Mängelbeseitigung'
        ]
    }
};
```

## Implementation Patterns

### HOAI Phase Manager
```javascript
class HOAIPhaseManager {
    constructor() {
        this.phases = HOAI_PHASES;
        this.currentPhase = null;
        this.completedDeliverables = new Set();
    }
    
    async validatePhaseTransition(fromPhase, toPhase) {
        // Cannot skip phases
        if (this.getPhaseNumber(toPhase) !== this.getPhaseNumber(fromPhase) + 1) {
            throw new HOAIComplianceError(
                `Cannot transition from ${fromPhase} to ${toPhase}. Phases must be sequential.`
            );
        }
        
        // All deliverables must be complete
        const required = this.phases[fromPhase].requiredDeliverables;
        const missing = required.filter(d => !this.completedDeliverables.has(d));
        
        if (missing.length > 0) {
            throw new HOAIComplianceError(
                `Missing deliverables for ${fromPhase}: ${missing.join(', ')}`
            );
        }
        
        // Verify with blockchain-like immutability
        await this.recordPhaseTransition(fromPhase, toPhase);
        
        return true;
    }
    
    async recordPhaseTransition(from, to) {
        const transition = {
            id: uuidv4(),
            from,
            to,
            timestamp: new Date().toISOString(),
            deliverables: Array.from(this.completedDeliverables),
            signature: await this.generateComplianceSignature()
        };
        
        // Immutable audit log
        await this.auditLog.record(transition);
        
        return transition;
    }
}
```

### LP6 - Tender Preparation Implementation
```javascript
class LP6TenderPreparation {
    constructor() {
        this.phase = 'LP6';
        this.dinStandards = {
            DIN276: 'Kosten im Bauwesen',
            DIN277: 'Grundflächen und Rauminhalte',
            VOB_A: 'Vergabe- und Vertragsordnung'
        };
    }
    
    async createLeistungsverzeichnis(project) {
        // Validate project is in correct phase
        if (project.currentPhase !== 'LP5') {
            throw new HOAIComplianceError('LP5 must be completed before LP6');
        }
        
        const lv = {
            projekt: project.id,
            datum: new Date().toISOString(),
            titel: await this.generateTitel(project),
            vorbemerkungen: await this.generateVorbemerkungen(project),
            positionen: []
        };
        
        // Extract positions from LP5 plans
        const positions = await this.extractPositions(project.ausführungspläne);
        
        // Generate standardized positions
        for (const pos of positions) {
            lv.positionen.push({
                oz: await this.generateOZ(pos),  // Ordnungszahl
                kurztext: pos.description,
                langtext: await this.generateLangtext(pos),
                menge: await this.calculateMenge(pos),
                einheit: this.determineEinheit(pos),
                ep: null,  // Einheitspreis - filled by bidders
                gp: null   // Gesamtpreis - calculated
            });
        }
        
        // Validate completeness
        await this.validateLeistungsverzeichnis(lv);
        
        return lv;
    }
    
    async calculateMengenermittlung(drawings) {
        const quantities = {
            timestamp: new Date().toISOString(),
            method: 'DIN277-2016',
            calculations: []
        };
        
        // Use VLM for drawing analysis
        const vlmService = ServiceRegistry.get('vlmService');
        
        for (const drawing of drawings) {
            const analysis = await vlmService.analyzeDrawing(drawing);
            
            const calc = {
                element: analysis.element,
                formel: analysis.formula,
                masse: analysis.dimensions,
                menge: await this.calculateFromFormula(analysis),
                einheit: analysis.unit,
                nachweis: this.generateNachweis(analysis)
            };
            
            quantities.calculations.push(calc);
        }
        
        // Cross-verify with manual calculations
        await this.crossVerifyQuantities(quantities);
        
        return quantities;
    }
}
```

### LP7 - Tender Support Implementation
```javascript
class LP7TenderSupport {
    constructor() {
        this.phase = 'LP7';
        this.evaluationCriteria = {
            preis: 0.6,      // 60% weight
            qualität: 0.25,  // 25% weight  
            termine: 0.15    // 15% weight
        };
    }
    
    async evaluateBids(bids, project) {
        // Ensure LP6 is complete
        const lp6Status = await this.verifyLP6Complete(project);
        if (!lp6Status.complete) {
            throw new HOAIComplianceError('LP6 must be completed before bid evaluation');
        }
        
        const evaluation = {
            projekt: project.id,
            datum: new Date().toISOString(),
            anzahlAngebote: bids.length,
            auswertung: []
        };
        
        // Formal bid opening protocol
        const opening = await this.createBidOpeningProtocol(bids);
        
        for (const bid of bids) {
            const analysis = {
                bieter: bid.company,
                angebotssumme: bid.total,
                formaleProüfung: await this.formalCheck(bid),
                rechnerischeProüfung: await this.mathematicalCheck(bid),
                technischeProüfung: await this.technicalCheck(bid),
                wirtschaftlicheProüfung: await this.economicCheck(bid),
                wertung: await this.calculateScore(bid)
            };
            
            evaluation.auswertung.push(analysis);
        }
        
        // Generate Vergabevorschlag
        evaluation.vergabevorschlag = await this.createAwardProposal(evaluation);
        
        return evaluation;
    }
    
    async createSubmissionMirror(evaluation) {
        // Submission mirror (Vergabevermerk) is mandatory
        const vermerk = {
            id: uuidv4(),
            datum: new Date().toISOString(),
            verfahrensart: evaluation.procurementType,
            teilnehmer: evaluation.auswertung.map(a => a.bieter),
            ausschlussgründe: [],
            wertungsergebnis: evaluation.vergabevorschlag,
            begründung: await this.generateBegründung(evaluation),
            unterschriften: []
        };
        
        // Digital signature for compliance
        vermerk.signature = await this.signDocument(vermerk);
        
        return vermerk;
    }
}
```

### DIN Standards Implementation
```javascript
class DINStandardsCompliance {
    async applyDIN276(kostenelement) {
        // DIN 276 - Building costs structure
        const kostengruppe = {
            '100': 'Grundstück',
            '200': 'Herrichten und Erschließen',
            '300': 'Bauwerk - Baukonstruktionen',
            '400': 'Bauwerk - Technische Anlagen',
            '500': 'Außenanlagen',
            '600': 'Ausstattung und Kunstwerke',
            '700': 'Baunebenkosten',
            '800': 'Finanzierung'
        };
        
        // Validate cost element belongs to correct group
        const gruppe = Math.floor(kostenelement.nummer / 100) * 100;
        if (!kostengruppe[gruppe]) {
            throw new DINComplianceError(`Invalid cost group: ${gruppe}`);
        }
        
        // Apply standardized calculation
        const calculation = {
            kostengruppe: gruppe,
            bezeichnung: kostengruppe[gruppe],
            untergruppe: kostenelement.nummer,
            menge: kostenelement.menge,
            einheit: kostenelement.einheit,
            einzelpreis: kostenelement.ep,
            gesamtpreis: kostenelement.menge * kostenelement.ep,
            umsatzsteuer: kostenelement.menge * kostenelement.ep * 0.19
        };
        
        return calculation;
    }
    
    async applyDIN277(flächenberechnung) {
        // DIN 277 - Floor areas and volumes
        const flächenarten = {
            BGF: 'Brutto-Grundfläche',
            KGF: 'Konstruktions-Grundfläche',
            NGF: 'Netto-Grundfläche',
            NUF: 'Nutzungsfläche',
            TF: 'Technikfläche',
            VF: 'Verkehrsfläche'
        };
        
        // Calculate according to DIN 277
        const berechnung = {
            bgf: await this.calculateBGF(flächenberechnung),
            kgf: await this.calculateKGF(flächenberechnung),
            ngf: null, // NGF = BGF - KGF
            nuf: await this.calculateNUF(flächenberechnung)
        };
        
        berechnung.ngf = berechnung.bgf - berechnung.kgf;
        
        // Validate ratios
        const ratio = berechnung.ngf / berechnung.bgf;
        if (ratio < 0.7 || ratio > 0.9) {
            console.warn(`NGF/BGF ratio ${ratio} outside typical range`);
        }
        
        return berechnung;
    }
}
```

### VOB/A Compliance
```javascript
class VOBCompliance {
    async validateProcurement(vergabe) {
        // VOB/A - German construction contract procedures
        const schwellenwerte = {
            national: 1000000,  // 1 Million EUR
            eu: 5382000        // EU threshold
        };
        
        // Determine procedure type
        let verfahren;
        if (vergabe.geschätzterWert < 25000) {
            verfahren = 'Direktauftrag';
        } else if (vergabe.geschätzterWert < schwellenwerte.national) {
            verfahren = 'BeschränkteAusschreibung';
        } else if (vergabe.geschätzterWert < schwellenwerte.eu) {
            verfahren = 'ÖffentlicheAusschreibung';
        } else {
            verfahren = 'EUweiteAusschreibung';
        }
        
        // Apply procedure rules
        const rules = await this.getProcedureRules(verfahren);
        
        // Validate compliance
        const validation = {
            verfahren,
            fristen: await this.validateDeadlines(vergabe, rules),
            bekanntmachung: await this.validatePublication(vergabe, rules),
            unterlagen: await this.validateDocuments(vergabe, rules),
            compliant: null
        };
        
        validation.compliant = Object.values(validation)
            .filter(v => typeof v === 'boolean')
            .every(v => v === true);
            
        return validation;
    }
}
```

### Construction Documentation
```javascript
class HOAIDocumentation {
    async generatePhaseDocument(phase, project) {
        const doc = {
            kopf: {
                projekt: project.name,
                bauherr: project.client,
                architekt: project.architect,
                phase: phase,
                datum: new Date().toISOString(),
                version: await this.getNextVersion(project, phase)
            },
            inhalt: await this.generatePhaseContent(phase, project),
            anlagen: await this.collectPhaseAttachments(phase, project),
            unterschriften: {
                architekt: null,
                bauherr: null,
                datum: null
            }
        };
        
        // Generate PDF with watermark
        const pdf = await this.generatePDF(doc, {
            watermark: 'HOAI-konform',
            locked: true,
            signatures: true
        });
        
        // Store immutably
        await this.storeDocument(pdf, {
            immutable: true,
            audit: true,
            backup: true
        });
        
        return pdf;
    }
    
    async generateBaujournal(date, activities) {
        // Daily construction journal is mandatory
        const journal = {
            datum: date,
            wetter: await this.getWeatherData(date),
            anwesende: {
                bauleitung: [],
                handwerker: [],
                sonstige: []
            },
            arbeiten: activities.map(a => ({
                firma: a.company,
                tätigkeit: a.activity,
                arbeiter: a.workers,
                stunden: a.hours,
                bemerkungen: a.notes
            })),
            behinderungen: [],
            anordnungen: [],
            fotos: await this.collectDailyPhotos(date),
            unterschrift: null
        };
        
        return journal;
    }
}
```

### Automated HOAI Validation
```javascript
class HOAIValidator {
    async validateProject(project) {
        const validation = {
            projectId: project.id,
            timestamp: new Date().toISOString(),
            phases: {}
        };
        
        // Validate each completed phase
        for (const phase of project.completedPhases) {
            validation.phases[phase] = await this.validatePhase(phase, project);
        }
        
        // Check phase sequence
        validation.sequenceValid = this.validatePhaseSequence(project.completedPhases);
        
        // Check deliverables
        validation.deliverablesComplete = await this.validateDeliverables(project);
        
        // Check fee calculation
        validation.feeCalculation = await this.validateFees(project);
        
        // Overall compliance
        validation.compliant = Object.values(validation).every(v => 
            typeof v === 'boolean' ? v : v.compliant
        );
        
        // Generate compliance certificate
        if (validation.compliant) {
            validation.certificate = await this.generateComplianceCertificate(validation);
        }
        
        return validation;
    }
    
    async validateFees(project) {
        // HOAI fee calculation validation
        const honorarzone = this.determineHonorarzone(project);
        const basishonorar = await this.calculateBasishonorar(
            project.kostenberechnung,
            honorarzone
        );
        
        const validation = {
            honorarzone,
            basishonorar,
            leistungsphasen: {},
            gesamthonorar: 0
        };
        
        // Calculate fee per phase
        for (const [phase, percentage] of Object.entries(HOAI_PHASES)) {
            if (project.completedPhases.includes(phase)) {
                validation.leistungsphasen[phase] = {
                    prozent: percentage.percentage,
                    honorar: basishonorar * (percentage.percentage / 100)
                };
                validation.gesamthonorar += validation.leistungsphasen[phase].honorar;
            }
        }
        
        return validation;
    }
}
```

## Error Handling

### HOAI-Specific Errors
```javascript
class HOAIComplianceError extends Error {
    constructor(message, phase = null, regulation = null) {
        super(message);
        this.name = 'HOAIComplianceError';
        this.phase = phase;
        this.regulation = regulation;
        this.timestamp = new Date().toISOString();
        
        // Log to compliance audit trail
        this.logComplianceViolation();
    }
    
    async logComplianceViolation() {
        await ComplianceAudit.log({
            type: 'HOAI_VIOLATION',
            message: this.message,
            phase: this.phase,
            regulation: this.regulation,
            timestamp: this.timestamp,
            stack: this.stack
        });
    }
}
```

## Testing HOAI Compliance

```javascript
describe('HOAI Compliance Tests', () => {
    it('should enforce phase sequence', async () => {
        const project = new HOAIProject();
        
        // Cannot skip from LP1 to LP3
        await expect(
            project.transitionToPhase('LP3')
        ).rejects.toThrow(HOAIComplianceError);
    });
    
    it('should validate deliverables', async () => {
        const lp6 = new LP6TenderPreparation();
        const project = { currentPhase: 'LP4' }; // Wrong phase
        
        await expect(
            lp6.createLeistungsverzeichnis(project)
        ).rejects.toThrow('LP5 must be completed before LP6');
    });
    
    it('should calculate fees correctly', async () => {
        const validator = new HOAIValidator();
        const project = {
            kostenberechnung: 1000000,
            completedPhases: ['LP1', 'LP2', 'LP3']
        };
        
        const fees = await validator.validateFees(project);
        
        // LP1 (2%) + LP2 (7%) + LP3 (15%) = 24%
        expect(fees.gesamthonorar).toBeCloseTo(
            fees.basishonorar * 0.24
        );
    });
});
```

## Integration with Construction Syndicate

```javascript
class HOAIConstructionSyndicate {
    async processConstructionTask(task) {
        // Determine HOAI phase
        const phase = this.determinePhase(task);
        
        // Select specialist based on phase
        const specialist = await this.selectSpecialist(phase);
        
        // Apply HOAI rules
        const hoaiCompliant = await this.applyHOAIRules(task, phase);
        
        // Process with compliance
        const result = await specialist.process(hoaiCompliant);
        
        // Validate result
        await this.validateHOAICompliance(result, phase);
        
        // Generate required documentation
        await this.generateHOAIDocumentation(result, phase);
        
        return result;
    }
}
```

## Best Practices

1. **Always Validate Phase Transitions**: Never allow skipping phases
2. **Document Everything**: HOAI requires comprehensive documentation
3. **Use Immutable Audit Logs**: Compliance requires proof
4. **Calculate Fees Automatically**: Prevent fee disputes
5. **Integrate VLM for Quantities**: Improve accuracy in LP6
6. **Digital Signatures**: Ensure document authenticity
7. **Cross-Reference Standards**: DIN, VOB, and HOAI work together

## Summary

HOAI compliance is not optional - it's legally mandatory for German construction projects. By building compliance directly into our code, we ensure:
- Legal compliance by default
- Automated documentation generation
- Fee transparency
- Quality assurance through phase gates
- Audit trail for disputes

Remember: HOAI is not just about fees - it's about ensuring quality and protecting both architects and clients through standardized processes!
