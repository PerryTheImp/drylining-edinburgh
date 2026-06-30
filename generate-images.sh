#!/bin/bash
# Generate all 21 images for Edinburgh Drylining site
# Uses Leonardo.ai API

API_KEY="693cdcd2-2681-47c1-9768-289ce34a50f2"
MODEL_ID="05ce0082-2d80-4a2d-8653-4d1c85e2418e"
OUTDIR="/Users/hendrixclaw/.openclaw/workspace/sites/drylining-edinburgh/public/images"

mkdir -p "$OUTDIR"

# Helper function to generate image
generate_image() {
    local filename="$1"
    local prompt="$2"
    local width="${3:-1536}"
    local height="${4:-864}"

    echo "Generating: $filename"

    # Create generation
    response=$(curl -s -X POST "https://cloud.leonardo.ai/api/rest/v1/generations" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"prompt\": \"$prompt\",
            \"modelId\": \"$MODEL_ID\",
            \"width\": $width,
            \"height\": $height,
            \"guidance_scale\": 7,
            \"num_inference_steps\": 30
        }")

    generation_id=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['sdGenerationJob']['generationId'])")
    echo "  Generation ID: $generation_id"

    # Poll for completion
    for i in {1..30}; do
        sleep 5
        status_resp=$(curl -s -X GET "https://cloud.leonardo.ai/api/rest/v1/generations/$generation_id" \
            -H "Authorization: Bearer $API_KEY")
        status=$(echo "$status_resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('generations_by_pk',{}).get('status','UNKNOWN'))")
        echo "  Status: $status (attempt $i)"

        if [ "$status" = "COMPLETE" ]; then
            url=$(echo "$status_resp" | python3 -c "import sys,json; d=json.load(sys.stdin); imgs=d.get('generations_by_pk',{}).get('generated_images',[]); print(imgs[0]['url'] if imgs else '')")
            if [ -n "$url" ]; then
                echo "  Downloading from: $url"
                curl -s -L "$url" -o "$OUTDIR/$filename"
                filesize=$(stat -f%z "$OUTDIR/$filename" 2>/dev/null || stat -c%s "$OUTDIR/$filename" 2>/dev/null)
                echo "  Saved: $filename ($filesize bytes)"
                return 0
            fi
        elif [ "$status" = "FAILED" ]; then
            echo "  FAILED!"
            return 1
        fi
    done

    echo "  Timeout waiting for generation"
    return 1
}

# =======================
# HERO (1)
# =======================
generate_image "hero-main.jpg" "Professional construction photography, Edinburgh Castle visible through large modern window, drylining plasterboard installation work in foreground, workers in hi-vis yellow vests and hard hats, warm red accent colors, professional interior renovation site, natural daylight streaming in, authentic documentary style, photorealistic, high detail, 16:9 landscape"

# =======================
# SERVICES (6)
# =======================
generate_image "service-drylining.jpg" "Close-up professional photography of plasterboard drylining installation, worker securing white plasterboard sheet to metal stud wall frame, construction site interior, clean sharp focus on joints and screws, warm lighting, professional construction photography, photorealistic, high detail"

generate_image "service-partition.jpg" "Modern commercial office interior with newly installed metal stud partition walls, white plasterboard panels, open plan office space, professional construction photography, clean lines, natural lighting through large windows, photorealistic, high detail"

generate_image "service-suspended-ceilings.jpg" "Suspended ceiling grid system being installed in modern commercial building, white ceiling tiles and LED panel lights visible, worker on ladder adjusting grid, clean professional construction photography, bright lighting, photorealistic, high detail"

generate_image "service-metal-stud.jpg" "Close-up of metal stud framing detail, construction worker measuring aluminum stud with tape measure, professional building site, shallow depth of field, warm industrial lighting, construction photography, photorealistic, high detail"

generate_image "service-plasterboard.jpg" "Construction team of two workers lifting large white plasterboard sheet together in commercial building interior, teamwork, wearing hi-vis vests and hard hats, professional construction photography, natural lighting, photorealistic, high detail"

generate_image "service-taping.jpg" "Extreme close-up of taping and jointing drywall seams, smooth professional finish, plasterboard joints being finished with joint compound, clean smooth surface, construction detail photography, sharp focus, photorealistic, high detail"

# =======================
# AREAS (6)
# =======================
generate_image "area-edinburgh.jpg" "Edinburgh Scotland cityscape view with construction scaffolding on historic stone building, modern renovation work, Edinburgh Castle visible in distance, professional urban construction photography, dramatic cloudy sky, warm tones, photorealistic, high detail"

generate_image "area-leith.jpg" "Leith waterfront Edinburgh, modern apartment building renovation with scaffolding, harbor water in background, professional construction photography, Scottish coastal town atmosphere, natural lighting, photorealistic, high detail"

generate_image "area-livingston.jpg" "Modern commercial office building in Livingston Scotland, contemporary glass and steel architecture, clean professional exterior photography, blue sky, landscaped grounds, photorealistic, high detail"

generate_image "area-falkirk.jpg" "Residential house renovation in Falkirk Scotland, scaffolding on traditional Scottish home, construction materials visible, suburban street setting, professional real estate photography style, warm lighting, photorealistic, high detail"

generate_image "area-dalkeith.jpg" "Town office interior fit-out in Dalkeith Scotland, modern partition walls being installed, suspended ceiling visible, professional commercial renovation photography, clean modern interior, natural lighting, photorealistic, high detail"

generate_image "area-musselburgh.jpg" "Coastal construction site in Musselburgh Scotland near the sea, modern building under construction with scaffolding, beach and coastline visible in background, professional construction photography, dramatic sky, photorealistic, high detail"

# =======================
# SUPPORTING (8)
# =======================
generate_image "about-team.jpg" "Professional drylining construction team of 4 workers standing together on Scottish building site, wearing hi-vis orange vests and white hard hats, confident poses, professional team photography, construction site background, natural outdoor lighting, photorealistic, high detail"

generate_image "quality-tools.jpg" "Professional construction tools neatly arranged on clean surface, drywall screw gun, tape measure, utility knife, trowel, spirit level, organized flat lay photography, clean professional product photography style, warm lighting, photorealistic, high detail"

generate_image "before-after-1.jpg" "Split image showing before and after drylining renovation, left side shows unfinished bare brick wall, right side shows smooth finished white plasterboard wall with perfect joints, professional real estate photography, dramatic lighting transformation, photorealistic, high detail"

generate_image "commercial-project.jpg" "Large commercial drylining project interior, expansive office space with multiple partition walls under construction, scaffolding, ladders, workers in hi-vis vests, professional wide angle construction photography, bright lighting, photorealistic, high detail"

generate_image "residential-project.jpg" "Modern finished home interior with completed drylining walls, smooth white plasterboard, freshly painted living room with furniture, natural warm lighting, cozy contemporary Scottish home, professional interior real estate photography, photorealistic, high detail"

generate_image "safety-compliance.jpg" "Close-up of CSCS construction safety cards displayed on clipboard alongside hi-vis vest, hard hat, safety goggles and work boots, professional flat lay photography, clean organized composition, construction safety compliance theme, photorealistic, high detail"

generate_image "free-quote.jpg" "Professional contractor in shirt reviewing architectural building plans with a client in modern office, friendly consultation meeting, laptop and blueprints on desk, professional business photography, warm lighting, photorealistic, high detail"

generate_image "trust-badge.jpg" "Professional display of insurance certificates, construction industry accreditations and compliance documents arranged on desk with company seal stamp, professional flat lay photography, clean organized composition, trust and credibility theme, photorealistic, high detail"

echo ""
echo "========================================"
echo "All images generated!"
echo "========================================"
ls -la "$OUTDIR"/*.jpg
