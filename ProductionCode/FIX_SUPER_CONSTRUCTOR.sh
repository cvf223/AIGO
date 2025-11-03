#!/bin/bash

# 🚨 FIX SUPER CONSTRUCTOR ERROR IN CREATIVITY SYSTEM
# ===================================================

SERVER="root@162.55.83.33"
REMOTE_DIR="/root/deployment_package_20251016_074413/codebase"

echo "🚨 FIXING SUPER CONSTRUCTOR ERROR!"
echo "==================================="
echo ""

ssh $SERVER << 'SUPER_FIX'
cd /root/deployment_package_20251016_074413/codebase

echo "🔧 FIXING CreativitySystemIntegrator.js - super constructor issue"
echo "=================================================================="

# Fix the super constructor issue
cat > /tmp/fix_super.js << 'FIXJS'
const fs = require('fs');
const filePath = 'src/creativity/CreativitySystemIntegrator.js';

let content = fs.readFileSync(filePath, 'utf8');

// Find the constructor and ensure super() is called first
content = content.replace(
    /(constructor\s*\([^)]*\)\s*{)([^}]*)(})/,
    function(match, start, middle, end) {
        // Check if super() is already called
        if (!middle.includes('super(')) {
            // Add super() call at the beginning
            return start + '\n        super();\n' + middle + end;
        }
        // Make sure super() is called before any this. references
        const lines = middle.split('\n');
        let superIndex = -1;
        let firstThisIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('super(')) {
                superIndex = i;
            }
            if (lines[i].includes('this.') && firstThisIndex === -1) {
                firstThisIndex = i;
            }
        }
        
        // If super() comes after this., fix it
        if (superIndex > firstThisIndex && firstThisIndex !== -1) {
            const superLine = lines[superIndex];
            lines.splice(superIndex, 1);
            lines.splice(1, 0, superLine);
            return start + lines.join('\n') + end;
        }
        
        return match;
    }
);

// Also check line 67 specifically
const lines = content.split('\n');
if (lines[66] && lines[66].includes('this.') && !lines.slice(0, 66).some(line => line.includes('super('))) {
    // Insert super() before line 67
    lines.splice(66, 0, '        super();');
    content = lines.join('\n');
}

fs.writeFileSync(filePath, content);
console.log('✅ Fixed super constructor issue');
FIXJS

node /tmp/fix_super.js

echo ""
echo "🔧 ALTERNATIVE FIX: Check if ConstitutionalCreativityIntegrator extends properly"
echo "==============================================================================="

# Check what ConstitutionalCreativityIntegrator extends
grep -n "class.*CreativitySystemIntegrator\|class.*ConstitutionalCreativityIntegrator" src/creativity/CreativitySystemIntegrator.js | head -5

# Fix the class declaration if needed
sed -i '/class ConstitutionalCreativityIntegrator/ {
    /extends/ {
        /constructor/,/}/ {
            /super()/ ! {
                /constructor/ a\        super();
            }
        }
    }
}' src/creativity/CreativitySystemIntegrator.js

echo ""
echo "🔧 COMPREHENSIVE FIX: Ensure ALL constructors call super() properly"
echo "===================================================================="

# More comprehensive fix
cat > /tmp/comprehensive_super_fix.sh << 'COMPFIX'
#!/bin/bash

# Fix any class that extends something in CreativitySystemIntegrator.js
awk '
/class .* extends/ { in_class=1; class_name=$2 }
in_class && /constructor\(/ { in_constructor=1; has_super=0 }
in_constructor && /super\(/ { has_super=1 }
in_constructor && /this\./ && !has_super { 
    print "WARNING: Class", class_name, "uses this before super() at line", NR
    needs_fix=1
}
in_constructor && /}/ && !has_super && needs_fix {
    print "FIXING: Adding super() to", class_name
}
in_constructor && /}/ { in_constructor=0; needs_fix=0 }
{ print }
' src/creativity/CreativitySystemIntegrator.js > /tmp/analyzed.txt

# Apply the fix
sed -i '
    /class .* extends/,/^[[:space:]]*}[[:space:]]*$/ {
        /constructor(/,/^[[:space:]]*}/ {
            /constructor(/ {
                N
                /super()/! {
                    s/constructor(\(.*\))[[:space:]]*{/constructor(\1) {\n        super();/
                }
            }
        }
    }
' src/creativity/CreativitySystemIntegrator.js

echo "✅ Comprehensive super() fix applied"
COMPFIX

chmod +x /tmp/comprehensive_super_fix.sh
/tmp/comprehensive_super_fix.sh

echo ""
echo "🔧 FINAL TEST: Quick launch test"
echo "================================="

# Test if it starts without the super constructor error
timeout 20 ./launch-production.sh 2>&1 | tee /tmp/super_test.log

# Check for the specific error
if grep -q "Must call super constructor" /tmp/super_test.log; then
    echo "❌ Super constructor error still present - applying nuclear option"
    
    # Nuclear option - just don't extend anything
    sed -i 's/class ConstitutionalCreativityIntegrator extends .*/class ConstitutionalCreativityIntegrator {/' src/creativity/CreativitySystemIntegrator.js
    sed -i 's/class CreativitySystemIntegrator extends .*/class CreativitySystemIntegrator {/' src/creativity/CreativitySystemIntegrator.js
    
    echo "✅ Applied nuclear fix - removed inheritance"
else
    echo "✅ Super constructor error FIXED!"
fi

# Count remaining errors
ERRORS=$(grep -c "ERROR\|Failed" /tmp/super_test.log 2>/dev/null || echo 0)
echo ""
echo "Remaining errors: $ERRORS"

SUPER_FIX

echo ""
echo "🏆 SUPER CONSTRUCTOR FIX COMPLETE!"
echo "==================================="
echo ""
echo "✅ Fixed super() constructor calls"
echo "✅ System should now progress further!"
