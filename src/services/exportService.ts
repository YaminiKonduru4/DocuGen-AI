import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } from "docx";
import PptxGenJS from "pptxgenjs";
import saveAs from "file-saver";
import { DocType } from "../types";
import type { Project } from "../types";

/**
 * Handles exporting projects to their respective formats.
 */
export const exportProject = async (project: Project): Promise<void> => {
  if (project.type === DocType.DOCX) {
    await exportToDocx(project);
  } else {
    await exportToPptx(project);
  }
};

const exportToDocx = async (project: Project) => {
  // Create sections children array
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: project.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  );

  // Subtitle/Topic
  children.push(
    new Paragraph({
      text: `Topic: ${project.mainTopic}`,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 }
    })
  );

  // Content Sections
  project.sections.forEach(section => {
    // Section Header
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            color: "auto",
            space: 1,
            size: 6,
            style: "single",
          },
        },
      })
    );

    // Split content by newlines to create proper paragraphs
    const lines = section.content.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 24 })], // 12pt font
            spacing: { after: 120 }
          })
        );
      }
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`);
};

const exportToPptx = async (project: Project) => {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  // Define Master Slide for consistent look
  pres.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: '0052cc' } } },
      { text: { text: 'DocuGen AI Generated', options: { x: 0.5, y: 0.2, w: '90%', fontSize: 14, color: 'FFFFFF', align: 'right' } } }
    ]
  });

  // Title Slide
  const titleSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
  titleSlide.addText(project.title, { 
    x: 1, y: 2, w: '80%', h: 1, 
    fontSize: 36, bold: true, color: '363636', align: 'center' 
  });
  titleSlide.addText(project.mainTopic, { 
    x: 1, y: 3.2, w: '80%', h: 1, 
    fontSize: 18, color: '808080', align: 'center' 
  });

  // Content Slides
  project.sections.forEach(section => {
    const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });

    // Slide Title
    slide.addText(section.title, { 
      x: 0.5, y: 0.2, w: '85%', h: 0.5, 
      fontSize: 24, bold: true, color: 'FFFFFF' 
    });

    // Clean up content for bullet points
    // Remove empty lines and try to identify bullets
    const lines = section.content.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => l.replace(/^[-*•]\s*/, '')); // Remove existing bullet chars to let PPT handle it

    slide.addText(lines.join('\n'), { 
      x: 0.5, y: 1.0, w: '90%', h: '75%', 
      fontSize: 18, 
      color: '363636', 
      bullet: true, 
      paraSpaceBefore: 10, 
      breakLine: true 
    });
  });

  await pres.writeFile({ fileName: `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx` });
};