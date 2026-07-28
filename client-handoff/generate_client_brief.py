#!/usr/bin/env python3

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    Flowable,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Frequency-Shift-Codex-Client-Brief.pdf"
WORDMARK = ROOT / "public" / "media" / "brand" / "frequency-shift-wordmark.png"

INK = colors.HexColor("#F2EFE9")
PAPER = colors.HexColor("#050506")
PANEL = colors.HexColor("#131016")
PANEL_LIGHT = colors.HexColor("#1C1720")
PINK = colors.HexColor("#EB73C1")
MAGENTA = colors.HexColor("#C548F0")
CYAN = colors.HexColor("#38DDEB")
MUTED = colors.HexColor("#B8B1BA")
LINE = colors.HexColor("#3B323F")
BLACK = colors.HexColor("#08070A")


def register_fonts():
    candidates = [
        (
            "/System/Library/Fonts/Supplemental/Avenir Next.ttc",
            "AvenirNext",
        ),
        (
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "ClientSans",
        ),
    ]
    for path, name in candidates:
        if Path(path).exists():
            try:
                pdfmetrics.registerFont(TTFont(name, path))
                return name
            except Exception:
                continue
    return "Helvetica"


FONT = register_fonts()


class AccentRule(Flowable):
    def __init__(self, width=1.1 * inch, height=5):
        super().__init__()
        self.width = width
        self.height = height

    def draw(self):
        self.canv.setStrokeColor(PINK)
        self.canv.setLineWidth(2.2)
        self.canv.line(0, 3.5, self.width * 0.62, 3.5)
        self.canv.setStrokeColor(CYAN)
        self.canv.line(self.width * 0.62, 3.5, self.width, 3.5)


def ascii_text(value):
    value.encode("ascii")
    return value


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="Kicker",
        fontName=FONT,
        fontSize=8,
        leading=10,
        textColor=CYAN,
        tracking=1.5,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="PageTitle",
        fontName=FONT,
        fontSize=25,
        leading=29,
        textColor=INK,
        spaceAfter=13,
    )
)
styles.add(
    ParagraphStyle(
        name="Section",
        fontName=FONT,
        fontSize=14,
        leading=18,
        textColor=PINK,
        spaceBefore=8,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyClient",
        fontName=FONT,
        fontSize=10.5,
        leading=15.2,
        textColor=INK,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="SmallClient",
        fontName=FONT,
        fontSize=8.5,
        leading=12.5,
        textColor=MUTED,
    )
)
styles.add(
    ParagraphStyle(
        name="Prompt",
        fontName=FONT,
        fontSize=10.5,
        leading=14.5,
        textColor=INK,
        leftIndent=0,
        spaceAfter=0,
    )
)
styles.add(
    ParagraphStyle(
        name="BoxTitle",
        fontName=FONT,
        fontSize=8,
        leading=10,
        textColor=CYAN,
        tracking=1,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="StepNumber",
        fontName=FONT,
        fontSize=21,
        leading=23,
        textColor=PINK,
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        name="StepTitle",
        fontName=FONT,
        fontSize=10,
        leading=13,
        textColor=INK,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="StepBody",
        fontName=FONT,
        fontSize=8.5,
        leading=12,
        textColor=MUTED,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverLabel",
        fontName=FONT,
        fontSize=9,
        leading=12,
        textColor=CYAN,
        tracking=2,
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        fontName=FONT,
        fontSize=36,
        leading=40,
        textColor=INK,
        alignment=TA_CENTER,
        spaceAfter=14,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverSub",
        fontName=FONT,
        fontSize=13,
        leading=18,
        textColor=MUTED,
        alignment=TA_CENTER,
    )
)


def paragraph(text, style="BodyClient"):
    return Paragraph(ascii_text(text), styles[style])


def bullet_list(items, level=0):
    return ListFlowable(
        [
            ListItem(
                paragraph(item, "BodyClient"),
                leftIndent=12,
                bulletColor=PINK,
            )
            for item in items
        ],
        bulletType="bullet",
        start="circle",
        leftIndent=17 + level * 10,
        bulletFontName=FONT,
        bulletFontSize=6,
        bulletColor=PINK,
        spaceAfter=5,
    )


def callout(label, body, accent=CYAN):
    content = [
        paragraph(label.upper(), "BoxTitle"),
        paragraph(body, "Prompt"),
    ]
    table = Table([[content]], colWidths=[6.92 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PANEL_LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.75, LINE),
                ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
                ("LEFTPADDING", (0, 0), (-1, -1), 16),
                ("RIGHTPADDING", (0, 0), (-1, -1), 16),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    return KeepTogether([table, Spacer(1, 10)])


def page_start(number, title, subtitle=None):
    items = [
        paragraph(f"{number:02d} / CLIENT GUIDE", "Kicker"),
        AccentRule(),
        Spacer(1, 5),
        paragraph(title, "PageTitle"),
    ]
    if subtitle:
        items.append(paragraph(subtitle, "BodyClient"))
    return items


def step_row(steps):
    cells = []
    for number, title, body in steps:
        cells.append(
            [
                paragraph(str(number), "StepNumber"),
                paragraph(f"<b>{title}</b>", "StepTitle"),
                paragraph(body, "StepBody"),
            ]
        )
    table = Table(
        [cells],
        colWidths=[1.72 * inch] * len(cells),
        rowHeights=[1.48 * inch],
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PANEL),
                ("BOX", (0, 0), (-1, -1), 0.75, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return table


def draw_page(canvas, doc):
    width, height = letter
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#100B12"))
    canvas.circle(width + 20, height - 30, 150, fill=1, stroke=0)
    canvas.setStrokeColor(PINK)
    canvas.setLineWidth(1.2)
    canvas.line(0, height - 12, width * 0.56, height - 12)
    canvas.setStrokeColor(CYAN)
    canvas.line(width * 0.56, height - 12, width, height - 12)

    if doc.page > 1:
        canvas.setFont(FONT, 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(42, 23, "FREQUENCY SHIFT / CODEX CLIENT BRIEF")
        canvas.setFillColor(CYAN)
        canvas.drawRightString(width - 42, 23, f"{doc.page:02d}")
    canvas.restoreState()


def build_story():
    story = []

    # Cover
    story.extend(
        [
            Spacer(1, 1.12 * inch),
            paragraph("FREQUENCY SHIFT / JULY 2026", "CoverLabel"),
            Spacer(1, 0.34 * inch),
            Image(str(WORDMARK), width=6.9 * inch, height=0.5 * inch),
            Spacer(1, 0.42 * inch),
            paragraph("Your plain-English guide to managing the website", "CoverTitle"),
            paragraph(
                "You describe what visitors should see. Codex handles the code, checks, GitHub, and publishing.",
                "CoverSub",
            ),
            Spacer(1, 0.52 * inch),
            callout(
                "The only rule to remember",
                "You do not need to know the technical name for anything. Describe the page, what you can see, and what you want to be different.",
                PINK,
            ),
            Spacer(1, 0.34 * inch),
            paragraph(
                "Prepared for new Frequency Shift website editors. No coding experience required.",
                "CoverLabel",
            ),
            PageBreak(),
        ]
    )

    # 2
    story.extend(
        page_start(
            1,
            "Four things to know",
            "Everything else in this guide is just a way to make these four ideas easier.",
        )
    )
    story.append(
        step_row(
            [
                (1, "Talk normally", "Write to Codex like you would message a person helping with the site."),
                (2, "Name what you see", "Use the page name, nearby words, or a screenshot. No coding terms needed."),
                (3, "Say preview or live", "Ask to see it first, or tell Codex to make the finished change live."),
                (4, "Wait for verification", "A change is live only after Codex checks the real public page."),
            ]
        )
    )
    story.extend(
        [
            Spacer(1, 18),
            paragraph("What Codex is doing for you", "Section"),
            bullet_list(
                [
                    "Finding the right part of the website.",
                    "Turning your description into an accurate design or content change.",
                    "Checking phones and computers.",
                    "Protecting changes other people are making.",
                    "Saving the work in GitHub.",
                    "Publishing the matching version and checking the public site.",
                ]
            ),
            callout(
                "You are still in control",
                "Codex will pause when a real decision is yours: unclear wording, an unconfirmed event fact, deleting a large area, changing a ticket link, or making a major design shift.",
            ),
            PageBreak(),
        ]
    )

    # 3
    story.extend(
        page_start(
            2,
            "Your first session",
            "Open the Frequency Shift project in Codex. The project will recognize that this computer is new.",
        )
    )
    story.extend(
        [
            paragraph("1. Accept the client assistant", "Section"),
            paragraph(
                "Codex will ask whether you want to enable the Frequency Shift website assistant. Say yes. Codex may show a normal approval window because it is adding the project tools to your Codex app.",
            ),
            paragraph("2. Start one new task", "Section"),
            paragraph(
                "After installation, start a new Codex task inside the same repository. This gives the assistant a clean start with all five Frequency Shift skills loaded.",
            ),
            paragraph("3. Try a harmless first request", "Section"),
            callout(
                "Copy and paste",
                "Show me the current website structure in plain English. Do not change or publish anything.",
                PINK,
            ),
            paragraph("4. Then make a real request", "Section"),
            callout(
                "Copy and paste",
                "On the home page, I want to change [what I can see] so it [desired result]. Show me before publishing.",
                CYAN,
            ),
            paragraph(
                "<b>If Codex asks for access:</b> read the short reason in the approval window. Approve normal website work you requested. Stop and ask Matia if it mentions ownership, billing, domains, passwords, or deleting a large amount of work.",
                "SmallClient",
            ),
            PageBreak(),
        ]
    )

    # 4
    story.extend(
        page_start(
            3,
            "How to describe a change",
            "A useful request needs a location, a visible target, the result you want, and whether it should go live.",
        )
    )
    story.extend(
        [
            callout(
                "The simple formula",
                "On [page], change [thing I can see] so it [desired result]. Use [new words, image, or link]. [Show me first / make it live].",
                PINK,
            ),
            paragraph("Good examples", "Section"),
            bullet_list(
                [
                    '"On the Events page, make the next event easier to notice and make it live."',
                    '"The large poster on the event page is cropped too tightly on my phone. Keep the whole poster visible and show me first."',
                    '"Replace the ticket link for The Experiment with this URL. Make it live."',
                    '"The home page feels crowded below the main photo. Make that area calmer without losing any information."',
                    '"Add this event using the details below. If an important fact is missing, ask me one question at a time."',
                ]
            ),
            paragraph("If you do not know where it is", "Section"),
            callout(
                "Still a valid request",
                "I do not know what it is called. It is the pink button beside the September event. I want it to be easier to notice.",
                CYAN,
            ),
            paragraph(
                "A screenshot is often the fastest way to point. Circle the area if you want. Codex can inspect the page and find the matching source.",
            ),
            PageBreak(),
        ]
    )

    # 5
    story.extend(
        page_start(
            4,
            "Words you can use",
            "Codex translates visual language internally. You never need to say padding, flex, div, card, component, or stylesheet.",
        )
    )
    visual_rows = [
        ["What you say", "What Codex will inspect"],
        ["More breathing room", "Nearby spacing, line height, and how crowded the area feels"],
        ["Less boxy", "Borders, panels, hard edges, and repeated containers"],
        ["Make it pop", "Visual importance, contrast, size, and surrounding quiet"],
        ["Cleaner", "Competing elements, alignment, repetition, and reading order"],
        ["Too zoomed", "Image crop, focal point, shape, and phone behavior"],
        ["Move it up", "The natural page flow and the space around the item"],
        ["More underground", "Dark atmosphere, restraint, photography, and less corporate framing"],
    ]
    table = Table(visual_rows, colWidths=[2.1 * inch, 4.82 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PINK),
                ("TEXTCOLOR", (0, 0), (-1, 0), BLACK),
                ("BACKGROUND", (0, 1), (-1, -1), PANEL),
                ("TEXTCOLOR", (0, 1), (-1, -1), INK),
                ("FONTNAME", (0, 0), (-1, -1), FONT),
                ("FONTSIZE", (0, 0), (-1, -1), 8.8),
                ("LEADING", (0, 0), (-1, -1), 12),
                ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.extend(
        [
            table,
            Spacer(1, 14),
            callout(
                "When you are unsure",
                "Say: I know how I want it to feel, but I do not know the design words. Give me two or three clear options.",
                CYAN,
            ),
            paragraph(
                "Codex should explain those options by what visitors will notice, not by code.",
                "SmallClient",
            ),
            PageBreak(),
        ]
    )

    # 6
    story.extend(
        page_start(
            5,
            "Preview, save, or make it live",
            "These phrases tell Codex how far to take the change.",
        )
    )
    story.extend(
        [
            callout(
                "Show me first",
                "Codex makes and checks the change locally. It does not publish it. Use this for visual experiments or anything you want to approve first.",
                CYAN,
            ),
            callout(
                "Save it but do not publish",
                "Codex safely records the finished work in GitHub or a separate change branch, but the public website stays as it is.",
                MAGENTA,
            ),
            callout(
                "Make it live",
                "Codex checks the work, saves it in GitHub, publishes the exact matching version, waits for completion, and checks the real public page.",
                PINK,
            ),
            paragraph("How to know it is really live", "Section"),
            bullet_list(
                [
                    "Codex says which page was checked.",
                    "Codex confirms the public site, not only a preview.",
                    "Codex mentions any important link, image, phone view, or interaction it verified.",
                    "If something prevented publishing, Codex says it is not live and gives one next step.",
                ]
            ),
            callout(
                "Important",
                "A saved file, a successful test, a GitHub push, or a deployment starting is not the same as a verified live update.",
                PINK,
            ),
            PageBreak(),
        ]
    )

    # 7
    story.extend(
        page_start(
            6,
            "What happens after you say 'make it live'",
            "You do not need to perform these steps. This page explains what Codex is checking on your behalf.",
        )
    )
    story.append(
        step_row(
            [
                (1, "Understand", "Codex finds the right page, wording, image, or interaction."),
                (2, "Build", "It updates the shared site source so all affected pages stay consistent."),
                (3, "Check", "It tests the site and inspects phone and computer views when needed."),
                (4, "Publish", "It protects other work, saves in GitHub, deploys the exact version, and checks public pages."),
            ]
        )
    )
    story.extend(
        [
            Spacer(1, 18),
            paragraph("If someone else changed the site too", "Section"),
            paragraph(
                "Codex checks the latest shared version before publishing. Routine overlaps are combined internally. It will only interrupt you when two versions represent a real choice.",
            ),
            callout(
                "What a real choice sounds like",
                "Someone else changed the same event description. I kept both versions safe. Should the live page use the shorter wording or the more detailed wording?",
                CYAN,
            ),
            paragraph("What Codex will not do", "Section"),
            bullet_list(
                [
                    "Erase another person's unknown work.",
                    "Force the shared history to accept an outdated version.",
                    "Publish an event fact it had to guess.",
                    "Call the job complete before checking the public result.",
                ]
            ),
            PageBreak(),
        ]
    )

    # 8
    story.extend(
        page_start(
            7,
            "GitHub in plain English",
            "GitHub is the shared history of the website. You can let Codex operate it for normal edits.",
        )
    )
    story.extend(
        [
            paragraph("<b>Repository</b> - the shared project containing the website and its history."),
            paragraph("<b>Commit</b> - a named checkpoint describing one finished change."),
            paragraph("<b>Push</b> - sending that checkpoint to the shared GitHub copy."),
            paragraph("<b>Branch</b> - a safe side copy used when work needs to stay separate temporarily."),
            paragraph("<b>Conflict</b> - two people changed the same area and Codex must combine or compare the results."),
            paragraph("<b>Main</b> - the shared line of finished work used for releases."),
            Spacer(1, 6),
            callout(
                "What you can say instead",
                "Save this change safely and make it live. Do not overwrite anything Matia is working on.",
                PINK,
            ),
            paragraph("Useful status questions", "Section"),
            bullet_list(
                [
                    '"Is my change saved in GitHub?"',
                    '"Is it live on the public website?"',
                    '"Did anyone else change the same area?"',
                    '"What is ready, and what is still waiting?"',
                    '"Can you undo only the change we just made?"',
                ]
            ),
            paragraph(
                "You do not need to choose Git commands or decide how to combine routine changes. If Codex asks you about a branch, rebase, merge, or force push without explaining the visible choice, ask it to restate the question in plain English.",
                "SmallClient",
            ),
            PageBreak(),
        ]
    )

    # 9
    story.extend(
        page_start(
            8,
            "Approvals, mistakes, and undo",
            "Most approval windows are Codex asking permission to complete something you requested on your computer or account.",
        )
    )
    story.extend(
        [
            paragraph("Usually normal for a website update", "Section"),
            bullet_list(
                [
                    "Reading and changing files in this repository.",
                    "Running the site's checks.",
                    "Connecting the repository's client skill pack.",
                    "Sending an approved change to GitHub.",
                    "Publishing through the existing Sites project.",
                ]
            ),
            paragraph("Stop and ask Matia first", "Section"),
            bullet_list(
                [
                    "Repository or Sites ownership changes.",
                    "DNS or domain changes.",
                    "Billing or paid-service changes.",
                    "Deleting a large amount of content or media.",
                    "Requests for passwords, private keys, payment details, or one-time login codes.",
                ]
            ),
            callout(
                "Undo a change",
                "Say: Undo only the change we just made, keep everyone else's work, check it, and make the corrected version live.",
                PINK,
            ),
            callout(
                "When something looks wrong",
                "Say which page you are viewing, whether it is on phone or computer, what you expected, and what you see instead. A screenshot is ideal.",
                CYAN,
            ),
            PageBreak(),
        ]
    )

    # 10
    story.extend(
        page_start(
            9,
            "Your quick-start card",
            "Keep this page nearby for the first few edits.",
        )
    )
    story.extend(
        [
            callout(
                "Add an event",
                "Add this event to the website using the details below. Ask me one question if an important fact is missing. Make it live after checking the event page, home page, and phone view.",
                PINK,
            ),
            callout(
                "Change the design",
                "On [page], the [visible area] feels [crowded / flat / too boxy / hard to read]. Make it feel [desired result] while keeping the Frequency Shift look. Show me first.",
                CYAN,
            ),
            callout(
                "Replace an image",
                "Replace the [visible image] with the attached file. Keep [the whole poster / the artist's face] visible, make it work on phones and computers, and [show me first / make it live].",
                MAGENTA,
            ),
            callout(
                "Check publication",
                "Tell me whether this exact change is live. Check the public page, not only GitHub or the deployment status.",
                PINK,
            ),
            callout(
                "Get unstuck",
                "I do not know what the area is called. I can see [nearby words or description]. I want it to [result]. Help me narrow it down in plain English.",
                CYAN,
            ),
            paragraph(
                "You cannot ruin the project by describing something imperfectly. Start with what you can see. Codex is expected to inspect, translate, ask only when necessary, and keep unsafe choices from becoming accidental live changes.",
            ),
            Spacer(1, 8),
            paragraph(
                "Frequency Shift website support pack / version 0.1.0",
                "CoverLabel",
            ),
        ]
    )

    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.58 * inch,
        bottomMargin=0.48 * inch,
        title="Frequency Shift Codex Client Brief",
        author="Frequency Shift",
        subject="Plain-English guide for managing the Frequency Shift website with Codex",
    )
    doc.build(build_story(), onFirstPage=draw_page, onLaterPages=draw_page)
    print(OUTPUT)


if __name__ == "__main__":
    main()
